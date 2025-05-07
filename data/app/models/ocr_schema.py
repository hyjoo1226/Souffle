# app/models/ocr_schema.py
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class OCREngineType(str, Enum):
    """지원되는 OCR 엔진 유형"""
    mathpix = "mathpix"
    trocr = "trocr"  # 추후 구현 예정


# 정답 이미지 OCR 요청/응답
class AnswerOCRRequest(BaseModel):
    """정답 이미지 OCR 요청 스키마"""
    answer_image_url: HttpUrl = Field(description="정답 이미지의 URL")
    engine: Optional[OCREngineType] = Field(default=None, description="사용할 OCR 엔진 유형")

class AnswerOCRResponse(BaseModel):
    """정답 이미지 OCR 응답 스키마"""
    answer_convert: str = Field(description="OCR로 변환된 정답 텍스트")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    engine_used: str = Field(description="실제 사용된 OCR 엔진")


# 분석 메타데이터 모델
class AnalysisMetadata(BaseModel):
    """분석 결과 메타데이터 스키마"""
    total_steps: int = Field(description="총 분석된 단계 수")
    error_count: int = Field(description="오류가 발견된 단계 수")
    problem_id: str = Field(description="문제 ID")
    grade: str = Field(description="학년 수준 (grade_1, grade_2 등)")
    engine: str = Field(description="사용된 OCR 엔진")
    analysis_type: str = Field(default="text", description="분석 유형 (text, image 등)")
    analysis_time: Optional[float] = Field(default=None, description="분석에 소요된 시간 (초)")
    extra_info: Optional[Dict[str, Any]] = Field(default=None, description="추가 메타데이터")


# 풀이 단계 분석 요청/응답
class StepImageInput(BaseModel):
    """풀이 단계 이미지 입력 스키마"""
    step_number: int = Field(description="풀이 단계 번호")
    step_time: int = Field(description="해당 단계에 소요된 시간(초)")
    step_image_url: HttpUrl = Field(description="단계별 풀이 이미지의 URL")

class AnalysisOCRRequest(BaseModel):
    """풀이 단계 분석 OCR 요청 스키마"""
    problem_id: str = Field(description="문제 ID")
    answer_image_url: HttpUrl = Field(description="정답 이미지의 URL")
    steps: List[StepImageInput] = Field(description="풀이 단계 이미지 목록")
    total_solve_time: int = Field(description="총 문제 해결 시간(초)")
    understand_time: int = Field(description="문제 이해 단계에 소요된 시간(초)")
    solve_time: int = Field(description="문제 풀이 단계에 소요된 시간(초)")
    review_time: int = Field(description="검토 단계에 소요된 시간(초)")
    engine: Optional[OCREngineType] = Field(default=None, description="사용할 OCR 엔진 유형")
    grade: Optional[str] = Field(default="grade_1", description="학년 수준 (grade_1, grade_2 등)")

class StepValidationResult(BaseModel):
    """풀이 단계 검증 결과 스키마"""
    step_number: int = Field(description="풀이 단계 번호")
    step_valid: bool = Field(description="단계의 유효성 여부")
    latex: str = Field(description="OCR로 변환된 LaTeX 텍스트")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    feedback: Optional[str] = Field(default=None, description="해당 단계에 대한 피드백")

class AnalysisOCRResponse(BaseModel):
    """풀이 단계 분석 OCR 응답 스키마"""
    steps: List[StepValidationResult] = Field(description="각 풀이 단계의 검증 결과 목록")
    ai_analysis: str = Field(description="AI의 종합적인 분석 내용")
    weakness: str = Field(description="학습자의 취약점 분석 결과")
    engine_used: str = Field(description="실제 사용된 OCR 엔진")
    metadata: AnalysisMetadata = Field(description="분석 결과의 메타데이터")
