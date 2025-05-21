# app/models/ocr_schema.py
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional


# 정답 이미지 OCR 요청/응답
class AnswerOCRRequest(BaseModel):
    answer_image_url: HttpUrl

class AnswerOCRResponse(BaseModel):
    answer_convert: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")


# test.test
class AnalysisRequest(BaseModel):
    paths: List[str]
class AnalysisResponse(BaseModel):
    latex : List[str]



# 풀이 단계 분석 요청/응답
class StepImageInput(BaseModel):
    step_number: int
    step_time: int
    step_image_url: HttpUrl  # 단계별 전체 스냅샷 이미지 URL

class AnalysisOCRRequest(BaseModel):
    problem_id: int
    answer_image_url: HttpUrl
    steps: List[StepImageInput]
    total_solve_time: int
    understand_time: int
    solve_time: int
    review_time: int

class StepValidationResult(BaseModel):
    step_number: int = Field(description="지금 보고있는 수식 이미지")
    step_valid: bool = Field(description="전 단계와 비교하여 변경 사항이 유효 하였는지 여부")
    latex: str = Field(description="수식 이미지를 LaTeX로 변경한 문자열")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    feedback: str = Field(default="잘 풀었습니다.", description="변경 사항에 대한 피드백")
    current_latex: str = Field(default="", description="이번 단계에 추가된 수식")

class AnalysisOCRResponse(BaseModel):
    steps: List[StepValidationResult] = Field(description="분석된 풀이 단계 목록")
    ai_analysis: str = Field(default="잘 풀었습니다.", description="풀이한 문제에 대한 분석")
    weakness: str = Field(default="취약점이 없습니다.", description="풀이한 현재 문제에서 보이는 약점")
    first_error_step: int = Field(default=0, description="처음 오류가 발생한 step_index 없다면 0")
    # metadata: Optional[dict] = None
