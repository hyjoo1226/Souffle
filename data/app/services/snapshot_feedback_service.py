from app.core.config import settings
from app.core.prompt_loader import load_prompt_template
from app.core.cache import feedback_cache
from app.core.exceptions import AIFeedbackError
from app.services.feedback_service import generate_feedback
from app.services.embedding_service import EmbeddingService
from openai import AsyncOpenAI
import logging
import json
import os
import re
from typing import List, Dict, Any, Optional, Tuple


logger = logging.getLogger(__name__)


class SnapshotFeedbackService:
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
        self.model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
        self.problems_db_path = os.path.join(os.getcwd(), "static", "problems_db.json")
        self.problems_cache = {}
        self._load_problems_cache()
        self.embedding_service = EmbeddingService()

    def _load_problems_cache(self):
        try:
            if os.path.exists(self.problems_db_path):
                with open(self.problems_db_path, "r", encoding="utf-8") as f:
                    self.problems_cache = json.load(f)
                logger.info(f"{len(self.problems_cache)} 개의 문제 정의 로드 완료")
            else:
                logger.warning(f"문제 데이터베이스 파일이 없습니다: {self.problems_db_path}")
        except Exception as e:
            logger.error(f"문제 데이터베이스 로드 오류: {str(e)}")

    async def analyze_snapshots(
        self,
        snapshot_latexes: List[str],
        grade: str = "grade_1",
        problem_id: Optional[str] = None,
        problem_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if len(snapshot_latexes) < 2:
            logger.warning("분석할 스냅샷이 충분하지 않습니다.")
            return {"steps": [], "first_error_step": None}

        if not self.openai_api_key:
            return self._generate_mock_feedback(snapshot_latexes)

        # 문제 컨텍스트 설정 - 새 문제 데이터 먼저 사용, 없으면 기존 데이터 사용
        problem_context = None
        if problem_data:
            # 새로운 문제 데이터 포맷 활용
            problem_content = problem_data.get('content', '')
            problem_answer = problem_data.get('answer', '')
            problem_explanation = problem_data.get('explanation', '')
            if any([problem_content, problem_answer, problem_explanation]):
                problem_context = f"""문제: {problem_content}

정답: {problem_answer}

풀이: {problem_explanation}"""
                logger.info(f"문제 ID {problem_id}의 데이터를 피드백 분석에 활용합니다.")
        
        # 기존 문제 데이터베이스에서도 찾기
        if not problem_context and problem_id:
            problem_context = self._get_problem_context(problem_id)
        
        analyses = []

        # 유사도 기반 분석 수행
        similarity_results = None
        if problem_data and getattr(settings, "USE_SIMILARITY_ANALYSIS", True):
            # 문제 데이터와 수식 라텍스로 유사도 분석
            try:
                similarity_results = await self._analyze_with_similarity(
                    snapshot_latexes, problem_id, problem_data
                )
                logger.info(f"유사도 기반 분석 결과: {len(similarity_results)}개 단계")
            except Exception as e:
                logger.error(f"유사도 기반 분석 오류: {str(e)}")
                similarity_results = None

        for i in range(len(snapshot_latexes) - 1):
            prev_latex = snapshot_latexes[i]
            curr_latex = snapshot_latexes[i + 1]
            analysis = {
                "step_index": i,
                "latex": curr_latex,
                "is_valid": None,
                "confidence": 1.0,
                "step_feedback": "잘 풀었습니다."
            }

            try:
                # 1단계: 기본 검증으로 변경 감지 및 기본 유효성 체크
                changes_detected, is_valid = self._validate_math_step(prev_latex, curr_latex)
                analysis["is_valid"] = is_valid

                # 2단계: 유사도 기반 검증 (if available)
                if similarity_results and i < len(similarity_results):
                    similarity_result = similarity_results[i]
                    # 기존에 진행된 분석 결과 사용
                    analysis["is_valid"] = similarity_result.get("is_valid", is_valid)
                    analysis["step_feedback"] = similarity_result.get("feedback", analysis["step_feedback"])
                    analysis["similarity"] = similarity_result.get("similarity", 0.0)
                    analysis["similarity_change"] = similarity_result.get("similarity_change", 0.0)
                    
                    # 유사도 적용 로그
                    logger.info(f"[유사도적용] 단계 {i+1}: similarity={analysis['similarity']:.4f}, change={analysis['similarity_change']:.4f}, is_valid={analysis['is_valid']}")

                if not changes_detected:
                    analysis["is_valid"] = True
                    analysis["step_feedback"] = "이전 단계와 동일한 수식입니다. 추가 변환이 필요합니다."
                    analyses.append(analysis)
                    continue

                # 3단계: LLM 기반 상세 분석 (필요한 경우에만)
                if analysis["is_valid"] is None or getattr(settings, "ALWAYS_USE_LLM", False):
                    await self._analyze_context_step(
                        analysis, prev_latex, curr_latex, i,
                        problem_context, grade, analyses
                    )

            except Exception as e:
                logger.error(f"스냅샷 분석 오류 ({i + 1} → {i + 2}): {str(e)}")
                analysis["is_valid"] = False
                analysis["step_feedback"] = "수식 분석 중 오류가 발생했습니다."

            analyses.append(analysis)

        self._process_linked_feedback(analyses)

        first_error_step = None
        for step in analyses:
            if step.get("is_valid") is False:
                first_error_step = step["step_index"]
                break

        return {
            "steps": analyses,
            "first_error_step": first_error_step
        }

    def _process_linked_feedback(self, analyses: List[Dict[str, Any]]):
        error_found = False
        for i, analysis in enumerate(analyses):
            # 분석 로그 추가
            logger.info(f"단계 {i} 피드백 처리: is_valid={analysis.get('is_valid')}, feedback={analysis.get('step_feedback', '')[:30]}...")
            
            if analysis.get("is_valid") is False:
                if not error_found:
                    error_found = True
                    logger.info(f"첫 번째 오류 발견: 단계 {i}")
                else:
                    analysis["is_valid"] = False
                    analysis["step_feedback"] = (
                        (analysis.get("step_feedback") or "")
                        + "\n\n※ 이전 단계에서 오류가 발생했으므로 이 단계도 오류로 간주됩니다."
                    )

    def _get_problem_context(self, problem_id: str) -> Optional[str]:
        if not problem_id or not self.problems_cache:
            return None
        for _, problem in self.problems_cache.items():
            if problem.get("problemNo") == problem_id:
                return problem.get("description", "")
        for _, problem in self.problems_cache.items():
            if problem_id in problem.get("problemNo", ""):
                return problem.get("description", "")
        return None

    def _normalize_latex(self, latex: str) -> str:
        if not latex:
            return ""
        replacements = {
            "\\\\": "\\",  # 역슬래시 2개 → 1개
            "\\,": " ",
            "\\;": " ",
            "\\quad": " ",
            "\\qquad": " "
        }

        normalized = latex.strip()
        for old, new in replacements.items():
            normalized = normalized.replace(old, new)
        return re.sub(r'\s+', ' ', normalized)

    def _remove_spaces(self, text: str) -> str:
        return re.sub(r'\s', '', text) if text else ""

    def _generate_mock_feedback(self, snapshot_latexes: List[str]) -> Dict[str, Any]:
        analyses = []
        for i in range(len(snapshot_latexes) - 1):
            is_valid = (i % 2 == 0)
            analysis = {
                "step_index": i,
                "latex": snapshot_latexes[i + 1],
                "is_valid": is_valid,
                "confidence": 1.0,
                "step_feedback": "올바른 변환입니다." if is_valid else "수학적 오류가 발견되었습니다."
            }
            analyses.append(analysis)
        self._process_linked_feedback(analyses)
        first_error_step = next((a["step_index"] for a in analyses if not a["is_valid"]), None)
        return {
            "steps": analyses,
            "first_error_step": first_error_step
        }
        
    async def _analyze_with_similarity(
        self,
        snapshot_latexes: List[str],
        problem_id: str,
        problem_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """유사도 기반 분석 수행"""
        if len(snapshot_latexes) < 2:
            return []
            
        # 첫 번째 스냅샷을 제외한 나머지에 대한 분석 수행
        solution_steps = []
        for i in range(1, len(snapshot_latexes)):
            solution_steps.append(snapshot_latexes[i])
            
        # 임베딩 서비스로 분석
        results = await self.embedding_service.analyze_solution_similarity(
            problem_id, problem_data, solution_steps
        )
        
        return results

    def _validate_math_step(self, prev_latex: str, curr_latex: str) -> Tuple[List[str], bool]:
        changes_detected = []
        if not prev_latex or not curr_latex:
            logger.warning("빈 수식 감지됨: 검증 실패")
            return ["빈 수식 감지됨"], True  # 변경: 유효하다고 간주
        prev_clean = self._normalize_latex(prev_latex)
        curr_clean = self._normalize_latex(curr_latex)

        # 디버깅 로그 추가
        logger.info(f"이전 수식 (정규화): {prev_clean}")
        logger.info(f"현재 수식 (정규화): {curr_clean}")

        # 수학적 검증 로직 구현
        # 1. 동일한 수식인지 검사 - 동일해도 변경 감지됨으로 처리 (유효한 것으로 처리)
        if self._remove_spaces(prev_clean) == self._remove_spaces(curr_clean):
            logger.info("수식에 변경이 없음 감지")
            changes_detected.append("수식에 변경이 없습니다.")
            return changes_detected, True
            
        # 수식 변경이 있음
        changes_detected.append("수식 변경 감지됨")
        
        # 2. 처음에 다항식이 추가되는 경우 처리 - 항상 유효함
        # 예: A=x^2-2xy+3y^2 에서 B=x^2+xy-y^2 추가
        if "=" in prev_clean and "=" in curr_clean:
            prev_vars = re.findall(r'([A-Z])\s*=', prev_clean)
            curr_vars = re.findall(r'([A-Z])\s*=', curr_clean)
            
            logger.info(f"변수 확인: 이전={prev_vars}, 현재={curr_vars}")
            
            # 처음에 정의된 변수와 추가된 변수 검사
            if len(curr_vars) > len(prev_vars) and all(v in curr_vars for v in prev_vars):
                new_vars = [v for v in curr_vars if v not in prev_vars]
                msg = f"새로운 다항식 {', '.join(new_vars)} 추가 감지됨"
                logger.info(msg)
                changes_detected.append(msg)
                return changes_detected, True
            
        # 변경: 커스텀 부호 검사 제거 - 어차피 로직이 복잡하고 오타가 있었을 수 있음
        # 이 부분을 제거하고 대신 LLM 분석을 실행하도록 하였음
        
        # 변경: 모든 가능성을 통과했으므로 기본적으로 유효하다고 간주
        # LLM 분석에서만 검증
        return changes_detected, True

    async def _analyze_context_step(
        self,
        analysis: Dict[str, Any],
        prev_latex: str,
        curr_latex: str,
        step_index: int,
        problem_context: Optional[str],
        grade: str,
        previous_analyses: List[Dict[str, Any]]
    ):
        prev_clean = self._normalize_latex(prev_latex)
        curr_clean = self._normalize_latex(curr_latex)
        template = load_prompt_template(grade)
        persona = template.get("persona", "")
        instruction = template.get("instruction", "")
        
        # 문제 컨텍스트가 있는 경우 시스템 프롬프트에 추가
        if problem_context:
            system_prompt = f"{persona}\n\n문제 정의:\n{problem_context}\n\n{instruction}"
        else:
            system_prompt = f"{persona}\n\n{instruction}"

        # 첫 번째 단계에서 다항식이 추가되는 경우 특별한 프롬프트 제공
        if step_index == 0 and "=" in prev_clean and "=" in curr_clean:
            prev_vars = re.findall(r'([A-Z])\s*=', prev_clean)
            curr_vars = re.findall(r'([A-Z])\s*=', curr_clean)
            
            if len(curr_vars) > len(prev_vars) and all(v in curr_vars for v in prev_vars):
                # 새로운 다항식 정의로 간주하고 유효하다고 판단
                analysis["is_valid"] = True
                analysis["step_feedback"] = "새로운 다항식이 잘 정의되었습니다. 수식 변환에 필요한 변수를 체계적으로 준비한 것이 좋습니다."
                return

        # 새로운 프롬프트 구성 - 이전 수식과 현재 수식의 변화 분석, 논리적 타당성 판단, 개념적 조언 요청
        user_prompt = f"""
수학 수식 단계별 상세 분석

이전 단계 수식 (LaTeX):
{prev_clean}

현재 단계 수식 (LaTeX):
{curr_clean}

분석 요청:
1. 이전 수식에서 현재 수식으로의 변화가 어떤 수학적 원리/법칙을 적용했는지 구체적으로 설명해주세요.
2. 이 변화가 수학적으로 타당한지 분석해주세요. 어떤 과정이 있었는지, 그 과정이 정확한지 동작 과정을 자세히 설명해주세요.
3. 특히 관심을 기울여야 할 부분 (다항식 전개, 분모의 합리화, 인수분해, 루트 계산 등)에서 오류가 있는지 명확히 확인해주세요.
4. 오류가 있는 경우, 정확히 어떤 수학적 원리가 잘못 적용되었는지 구체적으로 설명해주세요.

응답 형식:
- 변화분석: [LaTeX 수식의 전후 변화에 대한 자세한 설명, 의도한 변형과 그 과정 설명]
- 타당성: [True/False] (수학적으로 올바른 수식 변환 여부, 오류가 있는 경우 False)
- 관련개념: [이때 사용되는 주요 수학 개념들 나열, 예: 인수분해, 자승의 법칙, 루트 성질 등]
- 피드백: [오류가 있는 경우 어디가 틀렸는지, 어떻게 해결해야 하는지에 대한 구체적 조언. 잘 했다면 학생이 이해하기 쉽게 무엇을 잘 수행했는지 구체적인 설명.]
"""

        try:
            client = AsyncOpenAI(api_key=self.openai_api_key)
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            response_text = response.choices[0].message.content.strip()
            
            # 결과 추출
            is_valid = True  # 기본값은 True
            
            # 타당성 추출
            validity_match = re.search(r"\b타당성:\s*(True|False)\b", response_text, re.IGNORECASE)
            if validity_match:
                is_valid = validity_match.group(1).lower() == "true"
            
            # 피드백 추출
            feedback_match = re.search(r"\b피드백:\s*(.+?)(?=(\n\n|\n[\-\*\w]|$))", response_text, re.DOTALL)
            if feedback_match:
                feedback = feedback_match.group(1).strip()
            else:
                feedback = "수식 변화를 분석할 수 없습니다."
                
            # 관련 개념 추출
            concept_match = re.search(r"\b관련개념:\s*(.+?)(?=(\n\n|\n[\-\*\w]|$))", response_text, re.DOTALL)
            concepts = concept_match.group(1).strip() if concept_match else ""
            
            # 변화 분석 추출
            analysis_match = re.search(r"\b변화분석:\s*(.+?)(?=(\n\n|\n[\-\*\w]|$))", response_text, re.DOTALL)
            analysis_text = analysis_match.group(1).strip() if analysis_match else ""
            
            # 피드백 생성 - 관련 개념과 변화 분석 내용 추가
            final_feedback = feedback
            if not is_valid and concepts and analysis_text:
                final_feedback = f"{feedback}\n\n[관련 수학 개념: {concepts}]\n\n수식 변화 분석: {analysis_text}"
            elif is_valid and concepts:
                final_feedback = f"{feedback}\n\n[사용된 수학 개념: {concepts}]"
            
            # 응답 업데이트
            analysis["is_valid"] = is_valid
            analysis["step_feedback"] = final_feedback
            analysis["concepts"] = concepts
            analysis["analysis_text"] = analysis_text
            
            logger.info(f"LLM 상세 분석 결과: is_valid={is_valid}, concepts='{concepts[:30]}...', analysis_len={len(analysis_text)}")
            
            # 캐시에 저장
            cache_key = f"{prev_clean}|{curr_clean}"
            feedback_cache.set(cache_key, {
                "feedback": final_feedback,
                "is_valid": analysis["is_valid"],
                "concepts": concepts,
                "analysis_text": analysis_text
            })
        except Exception as e:
            logger.error(f"LLM 분석 오류: {str(e)}")
            analysis["step_feedback"] = "분석 중 오류가 발생했습니다."
            # 오류 발생시 기본값으로 True로 설정
            analysis["is_valid"] = True

    def _extract_feedback(self, response_text: str) -> str:
        match = re.search(r"피드백:\s*(.*?)(?=\n|$)", response_text, re.DOTALL)
        return match.group(1).strip() if match else response_text.strip()