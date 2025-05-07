# app/models/ocr_schema.py
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from enum import Enum


class OCREngineType(str, Enum):
    """지원되는 OCR 엔진 유형"""
    mathpix = "mathpix"
    trocr = "trocr"  # 추후 구현 예정


# 정답 이미지 OCR 요청/응답
class AnswerOCRRequest(BaseModel):
    answer_image_url: HttpUrl
    engine: Optional[OCREngineType] = None

class AnswerOCRResponse(BaseModel):
    answer_convert: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    engine_used: str


# test.test
class AnalysisRequest(BaseModel):
    paths: List[str]
class AnalysisResponse(BaseModel):
    latex : List[str]



# 풀이 단계 분석 요청/응답
class StepImageInput(BaseModel):
    step_number: int
    step_time: int
    step_image_url: HttpUrl

class AnalysisOCRRequest(BaseModel):
    problem_id: str
    answer_image_url: HttpUrl
    steps: List[StepImageInput]
    total_solve_time: int
    understand_time: int
    solve_time: int
    review_time: int
    engine: Optional[OCREngineType] = None

class StepValidationResult(BaseModel):
    step_number: int
    step_valid: bool
    latex: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    feedback: Optional[str] = None

class AnalysisOCRResponse(BaseModel):
    steps: List[StepValidationResult]
    ai_analysis: str
    weakness: str
    engine_used: str
    metadata: Optional[dict] = None
