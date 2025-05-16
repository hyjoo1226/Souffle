from pydantic import BaseModel, Field
from typing import Optional, List


class AnalyzedStep(BaseModel):
    """분석된 풀이 단계 스키마"""
    step_index: int = Field(description="풀이 전체 스탭샷 번호")
    latex: str = Field(description="OCR로 변환된 LaTeX 텍스트")
    is_valid: bool = Field(description="해당 단계의 유효성 여부")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    step_feedback: str = Field(default="잘 풀었습니다.", description="해당 단계에 대한 피드백")


class AnalysisResult(BaseModel):
    """분석 결과 스키마"""
    steps: List[AnalyzedStep] = Field(description="분석된 풀이 단계 목록")
    ai_analysis: str = Field(default="잘 풀었습니다.", description="풀이한 문제에 대한 분석")
    weakness: str = Field(default="취약점이 없습니다.", description="풀이한 현재 문제에서 보이는 약점")
    first_error_step: Optional[int] = Field(default=None, description="처음 오류가 발생한 step_index")
