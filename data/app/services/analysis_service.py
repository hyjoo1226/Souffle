# app/services/analysis_service.py
from typing import List
from app.models.result_schema import AnalysisResult, AnalyzedStep
from app.services.ocr import get_ocr_engine
from app.logic.equation_checker import analyze_step_change
from app.services.feedback_service import generate_feedback
from app.services.result_saver import save_analysis_result  # 파일 상단에 import


async def analyze_equation_steps(image_paths: List[str], grade: str = "grade_1") -> AnalysisResult:
    """
    전체 분석 플로우:
    - 이미지 → 수식 변환
    - 수식 간 논리적 검증
    - 오류 시 피드백 요청
    """
    ocr = get_ocr_engine()

    latex_list = []
    for img_path in image_paths:
        latex = await ocr.image_to_latex(img_path)
        latex_list.append(latex)

    steps = []
    for i, curr_expr in enumerate(latex_list):
        if i == 0:
            # 초기 수식은 비교하지 않음
            steps.append(AnalyzedStep(
                step_index=i,
                latex=curr_expr,
                is_valid=True
            ))
            continue

        prev_expr = latex_list[i - 1]
        analysis = analyze_step_change(prev_expr, curr_expr)

        feedback = None
        if not analysis["is_valid"]:
            feedback = await generate_feedback(
                analysis["prev_clean"], analysis["curr_clean"], step_number=i, grade=grade
            )

        steps.append(AnalyzedStep(
            step_index=i,
            latex=curr_expr,
            is_valid=analysis["is_valid"],
            feedback=feedback
        ))

    # 분석 완료 후 결과 저장
    step_logs = [
        {
            "step_number": s.step_index + 1,
            "latex": s.latex,
            "step_valid": s.is_valid,
            **({"feedback": s.feedback} if s.feedback else {})
        }
        for s in steps
    ]
    save_analysis_result(problem_id="unknown_problem", steps=step_logs, total_solve_time=None)

    return AnalysisResult(steps=steps)
