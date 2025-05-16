# app/services/analysis_service.py
from typing import List, Dict, Optional, Tuple
from app.models.result_schema import AnalysisResult, AnalyzedStep
from app.services.ocr import get_ocr_engine
from app.services.snapshot_feedback_service import SnapshotFeedbackService
from app.services.ai_analysis_service import AIAnalysisService
from app.services.result_saver import save_analysis_result
from app.core.exceptions import OCRError, MathParsingError
import logging

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
            step_feedback="첫 단계 수식입니다."
        ))
        
        # analysis_result["steps"]에서 각 분석 결과를 AnalyzedStep으로 변환
        for i, analysis in enumerate(analysis_result.get("steps", [])):
            step_index = i + 1  # 0-기반 인덱스로 변환
            
            if step_index < len(latex_list):
                steps.append(AnalyzedStep(
                    step_index=step_index,
                    latex=latex_list[step_index],
                    is_valid=analysis.get("is_valid", True),
                    confidence=confidence_list[step_index] if step_index < len(confidence_list) else 0.0,
                    step_feedback=analysis.get("step_feedback", "")
                ))
        
        # 분석 결과가 없거나 스텝 수가 맞지 않는 경우, 누락된 스텝 추가
        if len(steps) < len(latex_list):
            for i in range(len(latex_list)):
                if not any(step.step_index == i for step in steps):
                    steps.append(AnalyzedStep(
                        step_index=i,
                        latex=latex_list[i],
                        is_valid=True,  # 분석되지 않은 스텝은 유효한 것으로 간주
                        confidence=confidence_list[i] if i < len(confidence_list) else 0.0,
                        step_feedback="분석되지 않은 스텝입니다."
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