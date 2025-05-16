from app.core.config import settings
from app.core.prompt_loader import load_prompt_template
from app.core.cache import feedback_cache
from app.core.exceptions import AIFeedbackError
from app.services.feedback_service import generate_feedback
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
        problem_id: Optional[str] = None
    ) -> Dict[str, Any]:
        if len(snapshot_latexes) < 2:
            logger.warning("분석할 스냅샷이 충분하지 않습니다.")
            return {"steps": [], "first_error_step": None}

        if not self.openai_api_key:
            return self._generate_mock_feedback(snapshot_latexes)

        problem_context = self._get_problem_context(problem_id) if problem_id else None
        analyses = []

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
                changes_detected, is_valid = self._validate_math_step(prev_latex, curr_latex)
                analysis["is_valid"] = is_valid

                if not changes_detected:
                    analysis["is_valid"] = True
                    analysis["step_feedback"] = "이전 단계와 동일한 수식입니다. 추가 변환이 필요합니다."
                    analyses.append(analysis)
                    continue

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
            if analysis.get("is_valid") is False:
                if not error_found:
                    error_found = True
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

    def _validate_math_step(self, prev_latex: str, curr_latex: str) -> Tuple[List[str], bool]:
        changes_detected = []
        if not prev_latex or not curr_latex:
            return ["빈 수식 감지됨"], False
        prev_clean = self._normalize_latex(prev_latex)
        curr_clean = self._normalize_latex(curr_latex)

        # 수학적 검증 로직 구현
        # 1. 동일한 수식인지 검사
        if self._remove_spaces(prev_clean) == self._remove_spaces(curr_clean):
            changes_detected.append("수식에 변경이 없습니다.")
            return changes_detected, True
            
        # 2. 처음에 다항식이 추가되는 경우 처리
        # 예: A=x^2-2xy+3y^2 에서 B=x^2+xy-y^2 추가
        if "=" in prev_clean and "=" in curr_clean:
            prev_vars = re.findall(r'([A-Z])\s*=', prev_clean)
            curr_vars = re.findall(r'([A-Z])\s*=', curr_clean)
            
            # 처음에 정의된 변수와 추가된 변수 검사
            if len(curr_vars) > len(prev_vars) and all(v in curr_vars for v in prev_vars):
                new_vars = [v for v in curr_vars if v not in prev_vars]
                changes_detected.append(f"새로운 다항식 {', '.join(new_vars)} 추가 감지됨")
                return changes_detected, True
            
        # 3. 기본적인 부호 전개 오류 감지
        # 예: (A-B) 부호 전개 관련 오류 감지
        if "(" in prev_clean and ")" in prev_clean:
            # 괄호가 있는 표현에서 전개가 일어났다면 다음 수식에서 괄호가 없어야 함
            parenthesis_match = re.search(r'-([0-9]+)\(([A-Za-z0-9\s\+\-]+)\)', prev_clean)
            if parenthesis_match:
                # 분배법칙 검사 (예: -5(B-A) -> -5B+5A 이어야 함)
                coefficient = int(parenthesis_match.group(1))
                expression_inside = parenthesis_match.group(2)
                
                # 괄호 안에 있는 항들 추출
                terms_inside = re.findall(r'([\+\-]?\s*[0-9]*[A-Za-z])', expression_inside)
                
                # 현재 수식에서 부호가 전개된 항들 검사
                for term in terms_inside:
                    term_clean = self._remove_spaces(term.strip())
                    if term_clean.startswith('+') or not term_clean.startswith('-'):
                        # 양수 항은 부호가 바뀌어야 함 (-5(B+A) -> -5B-5A)
                        expected_term = f"-{coefficient}{term_clean.replace('+', '')}"
                        if expected_term not in self._remove_spaces(curr_clean):
                            changes_detected.append(f"부호 전개 오류: '{term_clean}' 항은 '{expected_term}'로 전개되어야 합니다.")
                            return changes_detected, False
                    else:
                        # 음수 항은 부호가 바뀌어야 함 (-5(B-A) -> -5B+5A)
                        expected_term = f"+{coefficient}{term_clean.replace('-', '')}"
                        if expected_term not in self._remove_spaces(curr_clean):
                            changes_detected.append(f"부호 전개 오류: '{term_clean}' 항은 '{expected_term}'로 전개되어야 합니다.")
                            return changes_detected, False

        changes_detected.append("수식 변경 감지됨")
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
        system_prompt = f"{persona}\n\n문제 정의: {problem_context}\n\n{instruction}" if problem_context else f"{persona}\n\n{instruction}"

        # 첫 번째 단계에서 다항식이 추가되는 경우 특별한 프롬프트 제공
        if step_index == 0 and "=" in prev_clean and "=" in curr_clean:
            prev_vars = re.findall(r'([A-Z])\s*=', prev_clean)
            curr_vars = re.findall(r'([A-Z])\s*=', curr_clean)
            
            if len(curr_vars) > len(prev_vars) and all(v in curr_vars for v in prev_vars):
                # 새로운 다항식 정의로 간주하고 유효하다고 판단
                analysis["is_valid"] = True
                analysis["step_feedback"] = "새로운 다항식이 잘 정의되었습니다. 수식 변환에 필요한 변수를 체계적으로 준비한 것이 좋습니다."
                return

        user_prompt = f"""
수학 수식 검토 요청

이전 수식 전체 이미지:
{prev_clean}

현재 수식 전체 이미지:
{curr_clean}

분석 요청:
- 괄호를 전개하는 과정에서 부호가 올바르게 적용되었는지 특히 주의 깊게 확인해 주세요.
- 잘못된 전개가 있는 경우 반드시 '유효성: False'로 표기해 주세요.
응답 형식:
- 유효성: [True/False]
- 설명: 수학적으로 왜 맞거나 틀렸는지 간단히 서술
- 피드백: 학생이 이해할 수 있는 설명 제공
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
            match = re.search(r"유효성:\s*(True|False)", response_text)
            if match:
                analysis["is_valid"] = match.group(1).lower() == "true"
            feedback = self._extract_feedback(response_text)
            analysis["step_feedback"] = feedback
            cache_key = f"{prev_clean}|{curr_clean}"
            feedback_cache.set(cache_key, {
                "feedback": feedback,
                "is_valid": analysis["is_valid"]
            })
        except Exception as e:
            logger.error(f"LLM 분석 오류: {str(e)}")
            analysis["step_feedback"] = "분석 중 오류가 발생했습니다."

    def _extract_feedback(self, response_text: str) -> str:
        match = re.search(r"피드백:\s*(.*?)(?=\n|$)", response_text, re.DOTALL)
        return match.group(1).strip() if match else response_text.strip()