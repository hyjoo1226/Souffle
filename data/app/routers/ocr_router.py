# app/routers/ocr_router.py
from fastapi import APIRouter
from app.models.ocr_schema import (
    AnswerOCRRequest, AnswerOCRResponse,
    AnalysisOCRRequest, AnalysisOCRResponse,
    StepValidationResult
)
from app.services.ocr import get_ocr_engine
from app.services.analysis_service import analyze_equation_steps
import tempfile
import httpx

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/answer", response_model=AnswerOCRResponse)
async def convert_answer_ocr(request: AnswerOCRRequest):
    ocr = get_ocr_engine()

    async with httpx.AsyncClient() as client:
        res = await client.get(str(request.answer_image_url))

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    temp_file.write(res.content)
    temp_file.close()

    latex = await ocr.image_to_latex(temp_file.name)
    return AnswerOCRResponse(answer_convert=latex)


@router.post("/analysis", response_model=AnalysisOCRResponse)
async def analyze_ocr_steps(request: AnalysisOCRRequest):
    image_paths = []

    async with httpx.AsyncClient() as client:
        for step in request.steps:
            response = await client.get(str(step.step_image_url), timeout=20.0)
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            temp_file.write(response.content)
            temp_file.close()
            image_paths.append(temp_file.name)

    result = await analyze_equation_steps(image_paths)

    incorrect = [s for s in result.steps if not s.is_valid]
    ai_analysis = f"{len(incorrect)}개의 단계에서 오류가 발견되었습니다."
    weakness = (
        "이항 또는 나눗셈 개념 적용에 오류가 있을 수 있습니다."
        if incorrect else "풀이 흐름에 논리적인 문제가 없어 보입니다."
    )

    return AnalysisOCRResponse(
        steps=[
            StepValidationResult(step_number=s.step_index + 1, step_valid=s.is_valid)
            for s in result.steps
        ],
        ai_analysis=ai_analysis,
        weakness=weakness
    )
