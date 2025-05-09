# app/services/analysis_service.py
from typing import List, Dict, Optional, Tuple
from app.models.result_schema import AnalysisResult, AnalyzedStep
from app.services.ocr import get_ocr_engine
from app.logic.equation_checker import analyze_step_change
from app.services.feedback_service import generate_feedback, generate_batch_feedback
from app.services.result_saver import save_analysis_result
from app.core.exceptions import OCRError, MathParsingError, StepValidationError
from app.models.ocr_schema import OCREngineType
import logging



# 로거 설정
logger = logging.getLogger(__name__)


async def analyze_equation_steps(
    image_paths: List[str], 
    grade: str = "grade_1", 
    engine_type: Optional[OCREngineType] = None
) -> AnalysisResult:
    """
    전체 분석 플로우:
    - 이미지 → 수식 변환
    - 수식 간 논리적 검증
    - 오류 시 피드백 요청
    
    Args:
        image_paths (List[str]): 분석할 이미지 파일 경로 리스트
        grade (str): 학년 수준 (grade_1, grade_2, ...)
        engine_type (Optional[OCREngineType]): 사용할 OCR 엔진 유형
        
    Returns:
        AnalysisResult: 분석 결과
    """
    try:
        # OCR 엔진 가져오기
        ocr = get_ocr_engine(engine_type)

        # 이미지 → LaTeX 변환
        logger.info(f"OCR 처리 시작: {len(image_paths)} 개 이미지")
        latex_list = []
        confidence_list = []
        
        for img_path in image_paths:
            result = await ocr.image_to_latex(img_path)
            latex_list.append(result.latex)
            confidence_list.append(result.confidence)

        # 각 단계 분석
        steps = []
        error_steps = []  # (step_num, prev_expr, curr_expr) 리스트
        
        for i, curr_expr in enumerate(latex_list):
            if i == 0:
                # 초기 수식은 비교하지 않음
                steps.append(AnalyzedStep(
                    step_index=i,
                    latex=curr_expr,
                    is_valid=True,
                    confidence=confidence_list[i]
                ))
                continue

            prev_expr = latex_list[i - 1]
            
            try:
                analysis = analyze_step_change(prev_expr, curr_expr)
                
                if not analysis["is_valid"]:
                    # 오류 단계 추가
                    error_steps.append((i, analysis["prev_clean"], analysis["curr_clean"]))
                
                steps.append(AnalyzedStep(
                    step_index=i,
                    latex=curr_expr,
                    is_valid=analysis["is_valid"],
                    confidence=confidence_list[i]
                ))
            
            except Exception as e:
                logger.error(f"분석 오류 (단계 {i}): {str(e)}")
                # 예외 발생 시 해당 단계 틀린 것으로 처리
                steps.append(AnalyzedStep(
                    step_index=i,
                    latex=curr_expr,
                    is_valid=False,
                    confidence=confidence_list[i],
                    feedback=f"분석 오류: {str(e)}"
                ))

        # 오류 단계가 있는 경우 피드백 생성 (일괄 처리)
        if error_steps:
            try:
                logger.info(f"AI 피드백 요청: {len(error_steps)} 개 단계")
                feedback_results = await generate_batch_feedback(error_steps, grade)
                
                # 각 단계에 피드백 추가
                for step_num, feedback in feedback_results.items():
                    steps[step_num].feedback = feedback
            
            except Exception as e:
                logger.error(f"AI 피드백 생성 오류: {str(e)}")
                # 오류 발생 시 간단한 오류 메시지 사용
                for i, _, _ in error_steps:
                    if not hasattr(steps[i], 'feedback') or not steps[i].feedback:  # 이미 피드백이 있는 경우 변경하지 않음
                        steps[i].feedback = "피드백 생성 중 오류가 발생했습니다."

        # 분석 완료 후 결과 저장
        step_logs = [
            {
                "step_number": s.step_index + 1,
                "latex": s.latex,
                "step_valid": s.is_valid,
                "confidence": getattr(s, 'confidence', 0.0),
                **({"feedback": s.feedback} if hasattr(s, 'feedback') and s.feedback else {})
            }
            for s in steps
        ]
        
        # 결과 저장
        save_path = save_analysis_result(
            problem_id="unknown_problem", 
            steps=step_logs, 
            total_solve_time=None,
            metadata={
                "engine": engine_type.value if engine_type else "mathpix",
                "grade": grade
            }
        )
        logger.info(f"분석 결과 저장 완료: {save_path}")

        return AnalysisResult(steps=steps)
    
    except OCRError as e:
        # OCR 오류
        logger.error(f"OCR 오류: {str(e)}")
        raise
    except Exception as e:
        # 기타 예외 처리
        logger.error(f"분석 서비스 오류: {str(e)}")
        raise
