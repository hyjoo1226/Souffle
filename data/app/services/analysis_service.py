# app/services/analysis_service.py
from typing import List, Dict, Optional, Tuple
from app.models.result_schema import AnalysisResult, AnalyzedStep
from app.services.ocr import get_ocr_engine
from app.services.snapshot_feedback_service import SnapshotFeedbackService
from app.services.ai_analysis_service import AIAnalysisService
from app.services.result_saver import save_analysis_result
from app.core.exceptions import OCRError, MathParsingError
import logging
import re
import difflib

# 로거 설정
logger = logging.getLogger(__name__)


async def analyze_equation_steps(
    image_paths: List[str], 
    grade: str = "grade_1",  # 모든 고등학교 수학은 grade_1로 통일
    problem_id: Optional[str] = None,  # 문제 ID 추가 (RAG용)
    step_times: Optional[List[int]] = None,  # 각 단계별 소요 시간 (밀리초)
    total_solve_time: Optional[int] = None,  # 총 풀이 시간 (밀리초)
    understand_time: Optional[int] = None,  # 문제 이해 시간 (밀리초)
    solve_time: Optional[int] = None,  # 문제 풀이 시간 (밀리초)
    review_time: Optional[int] = None  # 문제 검토 시간 (밀리초)
) -> AnalysisResult:
    """
    전체 분석 플로우:
    - 이미지 → 수식 변환
    - 스냅샷 간 비교 분석 (LLM 활용)
    - 오류 시 피드백 제공
    
    Args:
        image_paths (List[str]): 분석할 이미지 파일 경로 리스트
        grade (str): 학년 수준 (grade_1, grade_2, ...)
        problem_id (Optional[str]): 문제 ID (RAG 구현을 위해 추가)
        step_times (Optional[List[int]]): 각 단계별 소요 시간 (밀리초)
        total_solve_time (Optional[int]): 총 풀이 시간 (밀리초)
        understand_time (Optional[int]): 문제 이해 시간 (밀리초)
        solve_time (Optional[int]): 문제 풀이 시간 (밀리초)
        review_time (Optional[int]): 문제 검토 시간 (밀리초)
        
    Returns:
        AnalysisResult: 분석 결과
    """
    try:
        # OCR 엔진 가져오기 - mathpix 고정
        ocr = get_ocr_engine("mathpix")

        # 이미지 → LaTeX 변환
        logger.info(f"OCR 처리 시작: {len(image_paths)} 개 이미지")
        latex_list = []
        confidence_list = []
        
        for img_path in image_paths:
            result = await ocr.image_to_latex(img_path)
            latex_list.append(result.latex)
            confidence_list.append(result.confidence)
        
        # 스냅샷 피드백 서비스 초기화
        feedback_service = SnapshotFeedbackService()
        
        # 스냅샷 간 반복적 분석 수행
        logger.info(f"스냅샷 분석 시작: {len(latex_list)} 개 스냅샷")
        analysis_result = await feedback_service.analyze_snapshots(
            latex_list, 
            grade,
            problem_id
        )
        
        # 분석 결과를 AnalyzedStep 목록으로 변환
        steps = []
        
        # 첫 번째 스텝은 비교 대상이 아니면서 기본적으로 유효한 것으로 처리
        steps.append(AnalyzedStep(
            step_index=0,
            latex=latex_list[0],
            is_valid=True,
            confidence=confidence_list[0],
            step_feedback="첫 단계 수식입니다.",
            current_latex=latex_list[0]  # 첫 단계는 전체가 새로운 수식
        ))
        
        # analysis_result["steps"]에서 각 분석 결과를 AnalyzedStep으로 변환
        for i, analysis in enumerate(analysis_result.get("steps", [])):
            step_index = i + 1  # 0-기반 인덱스로 변환
            
            if step_index < len(latex_list):
                # 현재 단계와 이전 단계의 수식 비교하여 추가된 부분 찾기
                prev_latex = latex_list[step_index - 1]
                curr_latex = latex_list[step_index]
                current_latex = await extract_new_content(prev_latex, curr_latex)
                
                steps.append(AnalyzedStep(
                    step_index=step_index,
                    latex=latex_list[step_index],
                    is_valid=analysis.get("is_valid", True),
                    confidence=confidence_list[step_index] if step_index < len(confidence_list) else 0.0,
                    step_feedback=analysis.get("step_feedback", ""),
                    current_latex=current_latex
                ))
        
        # 분석 결과가 없거나 스텝 수가 맞지 않는 경우, 누락된 스텝 추가
        if len(steps) < len(latex_list):
            for i in range(len(latex_list)):
                if not any(step.step_index == i for step in steps):
                    # 현재 단계와 이전 단계의 수식 비교하여 추가된 부분 찾기
                    prev_latex = latex_list[i-1] if i > 0 else ""
                    curr_latex = latex_list[i]
                    current_latex = await extract_new_content(prev_latex, curr_latex) if i > 0 else curr_latex
                    
                    steps.append(AnalyzedStep(
                        step_index=i,
                        latex=latex_list[i],
                        is_valid=True,  # 분석되지 않은 스텝은 유효한 것으로 간주
                        confidence=confidence_list[i] if i < len(confidence_list) else 0.0,
                        step_feedback="분석되지 않은 스텝입니다.",
                        current_latex=current_latex
                    ))
        
        # 스텝 순서로 정렬
        steps.sort(key=lambda step: step.step_index)

        # first_error_step 찾기
        first_error_step = analysis_result.get("first_error_step")
        
        # AI 분석 서비스 초기화 및 종합 분석 생성
        ai_analysis_service = AIAnalysisService()
        
        # 첫 번째 오류 step을 올바르게 확인
        # step_number는 1부터 시작하고 step_index는 0부터 시작하므로 +1 추가
        first_error_step_number = None
        if first_error_step is not None:
            # steps 리스트에서 실제 첫 번째 오류 단계 수집
            for i, step in enumerate(steps):
                if not step.is_valid:
                    # 실제 사용자가 보는 step_number 값 사용
                    first_error_step_number = step.step_index + 1  # 0-based 인덱스에 +1
                    logger.info(f"첫 번째 오류 단계: {first_error_step_number}")
                    break
                    
        if first_error_step_number is None and first_error_step is not None:
            # 만약 오류 단계를 찾지 못했지만 first_error_step이 있다면
            first_error_step_number = first_error_step + 1  # 0-based 인덱스에 +1
            logger.info(f"폴백 first_error_step 값 사용: {first_error_step_number}")
        
        ai_analysis_result = await ai_analysis_service.generate_comprehensive_analysis(
            steps=steps,
            first_error_step=first_error_step_number,  # step_number 형식으로 전달
            step_times=step_times,  # 시간 단위는 초(sec)
            total_solve_time=total_solve_time,
            understand_time=understand_time,
            solve_time=solve_time,
            review_time=review_time
        )
        
        ai_analysis = ai_analysis_result.get("ai_analysis", "분석 정보가 없습니다.")
        weakness = ai_analysis_result.get("weakness", "약점 분석 정보가 없습니다.")
        
        # AI 분석에서 첫 번째 오류가 발생한 단계 번호 확인
        import re
        # 첫 번째 오류 관련 텍스트 부분 확인
        error_step_match = re.search(r"(\d+)\s*번째 단계에서 첫 오류", ai_analysis)
        if error_step_match and first_error_step_number is not None:
            mentioned_step = int(error_step_match.group(1))
            if mentioned_step != first_error_step_number:
                # 오류 단계 번호가 틀린 경우, 올바른 값으로 수정
                ai_analysis = ai_analysis.replace(
                    f"{mentioned_step}번째 단계에서 첫 오류", 
                    f"{first_error_step_number}번째 단계에서 첫 오류"
                )
                logger.info(f"수정된 AI 분석: {ai_analysis}")

        # 분석 완료 후 결과 저장
        step_logs = [
            {
                "step_number": s.step_index + 1,
                "latex": s.latex,
                "step_valid": s.is_valid,
                "confidence": s.confidence,
                "feedback": s.step_feedback if s.step_feedback != "잘 풀었습니다." else ""
            }
            for s in steps
        ]
        
        # 결과 저장
        save_path = save_analysis_result(
            problem_id=problem_id or "unknown_problem", 
            steps=step_logs, 
            total_solve_time=total_solve_time,
            metadata={
                "grade": grade,
                "analysis_method": "snapshot_llm",
                "ai_analysis": ai_analysis,
                "weakness": weakness,
                "understand_time": understand_time,
                "solve_time": solve_time,
                "review_time": review_time
            }
        )
        logger.info(f"분석 결과 저장 완료: {save_path}")
        
        # result_schema.py에는 ai_analysis와 weakness 필드가 없지만, 클라이언트에서 필요한 체계
        # 이 분석 결과는 ocr_router에서 사용됨
        # AnalysisResult 객체에 저장하지 않고 로깅만 함
        logger.info(f"AI 분석: {ai_analysis}")
        logger.info(f"약점 분석: {weakness}")

        # 분석 결과를 반환할 때 LLM 분석 결과도 함께 저장
        # 이제 Pydantic 모델 필드로 직접 할당
        result = AnalysisResult(
            steps=steps,
            ai_analysis=ai_analysis,
            weakness=weakness,
            first_error_step=first_error_step
        )
        
        # 로그에 AI 분석 결과 기록
        logger.info(f"AnalysisResult 객체 생성 완료: ai_analysis, weakness 필드 설정")

        return result
    
    except OCRError as e:
        # OCR 오류
        logger.error(f"OCR 오류: {str(e)}")
        raise
    except Exception as e:
        # 기타 예외 처리
        logger.error(f"분석 서비스 오류: {str(e)}")
        raise


async def extract_new_content(prev_latex: str, curr_latex: str) -> str:
    """
    이전 수식과 현재 수식을 비교하여 추가된 내용을 LLM에게 물어 그 결과를 반환합니다.
    
    Args:
        prev_latex (str): 이전 단계의 LaTeX 수식
        curr_latex (str): 현재 단계의 LaTeX 수식
        
    Returns:
        str: 현재 단계에서 새롭게 추가된 LaTeX 수식
    """
    from app.core.config import settings
    from openai import AsyncOpenAI
    import json
    
    # 첫 단계의 경우 전체 내용을 반환
    if not prev_latex:
        return curr_latex
        
    # 공백 처리와 기본 체크
    prev_latex = prev_latex.strip()
    curr_latex = curr_latex.strip()
    
    # 완전히 동일한 경우 빈 내용 반환
    if prev_latex == curr_latex:
        return ""
    
    try:
        # OpenAI API 키 가져오기
        api_key = settings.OPENAI_API_KEY
        model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini") 
        
        if not api_key:
            # API 키가 없으면 기본 로직으로 반환
            return await fallback_extract_new_content(prev_latex, curr_latex)
        
        # LLM에게 수식 비교 요청
        client = AsyncOpenAI(api_key=api_key)
        system_prompt = """당신은 학생의 수학 풀이 과정을 분석하는 전문가입니다. 
두 단계의 LaTeX 수식을 비교하여 현재 단계에 추가된 부분만 추출해야 합니다.

이전 단계의 수식과 현재 단계의 수식을 비교하여, 오직 새로 추가된 부분만 LaTeX 형식으로 추출해 주세요.

추가된 부분이 없다면 빈 문자열을 반환하세요.

반드시 JSON 형식으로 다음과 같이 응답해야 합니다: {"added_content": "LaTeX 형식의 추가된 수식"}
다른 설명이나 메시지는 포함하지 마세요. JSON만 반환하세요."""
        
        user_prompt = f"""이전 LaTeX 수식: {prev_latex}

현재 LaTeX 수식: {curr_latex}

위 두 수식을 비교해서, 현재 수식에서 이전 수식에 비해 추가된 부분만 추출해 주세요. 
이전 수식에 없는 부분만 추출하세요."""
        
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # 응답 추출
        response_text = response.choices[0].message.content.strip()
        
        try:
            response_json = json.loads(response_text)
            added_content = response_json.get("added_content", "")
            
            # 추가된 내용이 지나치게 길다면, 원본 비교 방식으로 둘 수 있음
            if len(added_content) > len(curr_latex):
                return await fallback_extract_new_content(prev_latex, curr_latex)
                
            return added_content
        except json.JSONDecodeError:
            # JSON 파싱 오류시 텍스트 응답에서 추가된 내용 추출 시도
            logger.warning(f"JSON 파싱 오류 발생: {response_text}")
            return await fallback_extract_new_content(prev_latex, curr_latex)
    
    except Exception as e:
        # 오류 발생시 기본 알고리즘으로 돌아감
        logger.error(f"LLM 수식 추출 오류: {str(e)}")
        return await fallback_extract_new_content(prev_latex, curr_latex)


async def fallback_extract_new_content(prev_latex: str, curr_latex: str) -> str:
    """
    LLM이 수식 추출에 실패할 경우 사용하는 백업 차이감지 방법
    
    Args:
        prev_latex (str): 이전 단계의 LaTeX 수식
        curr_latex (str): 현재 단계의 LaTeX 수식
        
    Returns:
        str: 현재 단계에서 새롭게 추가된 LaTeX 수식
    """
    if not prev_latex:
        return curr_latex
        
    # 공백과 줄바꿈 정규화
    prev_latex = prev_latex.strip()
    curr_latex = curr_latex.strip()
    
    # 완전히 동일한 경우 빈 내용 반환
    if prev_latex == curr_latex:
        return ""

    # array 환경 처리 로직
    array_content_re = re.compile(r'\\begin\{array\}(?:\{[^}]*\})?(.*?)\\end\{array\}', re.DOTALL)
    
    # array 환경이 있는지 확인
    prev_has_array = '\\begin{array}' in prev_latex
    curr_has_array = '\\begin{array}' in curr_latex
    
    # array 환경 내용 추출
    if curr_has_array:
        # 현재 array 내용 추출
        curr_array_match = array_content_re.search(curr_latex)
        if curr_array_match:
            curr_array_content = curr_array_match.group(1).strip()
            curr_lines = [line.strip() for line in curr_array_content.split('\\\\') if line.strip()]
            
            # 이전 내용과 비교
            if prev_has_array:
                # 이전 array 내용 추출
                prev_array_match = array_content_re.search(prev_latex)
                if prev_array_match:
                    prev_array_content = prev_array_match.group(1).strip()
                    prev_lines = [line.strip() for line in prev_array_content.split('\\\\') if line.strip()]
                    
                    # 이전에 없던 새 라인 찾기
                    added_lines = []
                    for line in curr_lines:
                        if line not in prev_lines:
                            added_lines.append(line)
                    
                    if added_lines:
                        return "\n".join(added_lines)
                    
                    # 라인 비교해서 추가된 부분 찾기
                    for curr_line in curr_lines:
                        for prev_line in prev_lines:
                            if curr_line != prev_line and prev_line in curr_line:
                                # 기존 라인이 현재 라인에 포함되는 경우
                                added_content = curr_line.replace(prev_line, '', 1).strip()
                                if added_content:
                                    return added_content
            else:
                # 이전에 array가 없었으므로 첫번째 줄만 반환 (일반적으로 첫번째 줄이 새로 추가된 내용)
                if curr_lines and len(curr_lines) > 0:
                    # 이전 내용과 비교하여 완전히 포함된 라인 제외
                    for line in curr_lines:
                        if prev_latex not in line and line not in prev_latex:
                            return line
    
    # 비 array 환경의 처리 또는 array 특수 처리에서 결과를 못 찾은 경우
    
    # 줄 단위로 비교
    prev_lines = [line.strip() for line in prev_latex.split('\n') if line.strip()]
    curr_lines = [line.strip() for line in curr_latex.split('\n') if line.strip()]
    
    # 전체 개행 문자를 공백으로 변환한 단일 문자열
    prev_single_line = ' '.join(prev_lines)
    curr_single_line = ' '.join(curr_lines)
    
    # 새로운 줄이 추가된 경우
    new_lines = []
    for line in curr_lines:
        if line not in prev_lines:
            # 이미 존재하는 줄에 추가된 부분인지 확인
            is_addition = False
            for prev_line in prev_lines:
                if prev_line in line and prev_line != line:
                    # 추가된 부분 추출
                    added_content = line.replace(prev_line, '', 1).strip()
                    if added_content:
                        new_lines.append(added_content)
                        is_addition = True
                        break
            
            # 기존 줄에 추가된 부분이 아니면 새 줄 그대로 추가
            if not is_addition:
                new_lines.append(line)
    
    # 새 줄이 있으면 반환
    if new_lines:
        return '\n'.join(new_lines)
    
    # 추가된 텍스트가 없는 경우 전체 문자열 레벨에서 비교
    if prev_single_line in curr_single_line and prev_single_line != curr_single_line:
        added_content = curr_single_line.replace(prev_single_line, '', 1).strip()
        if added_content:
            return added_content
    
    # difflib을 사용한 문자열 비교
    matcher = difflib.SequenceMatcher(None, prev_single_line, curr_single_line)
    diff_blocks = []
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag in ('insert', 'replace'):
            diff_part = curr_single_line[j1:j2]
            if diff_part.strip():
                diff_blocks.append(diff_part)
    
    if diff_blocks:
        # 중복 제거 및 정렬된 차이점 반환
        diff_content = ' '.join(diff_blocks)
        return diff_content
    
    # 모든 방법으로 새 내용을 찾지 못한 경우
    return ""
