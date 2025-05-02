# app/models/ocr_schema.py
from pydantic import BaseModel, HttpUrl
from typing import List


# 정답 이미지 OCR 요청/응답
class AnswerOCRRequest(BaseModel):
    answer_image_url: HttpUrl

class AnswerOCRResponse(BaseModel):
    answer_convert: str


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

class StepValidationResult(BaseModel):
    step_number: int
    step_valid: bool

class AnalysisOCRResponse(BaseModel):
    steps: List[StepValidationResult]
    ai_analysis: str
    weakness: str
