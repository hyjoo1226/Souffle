# app/models/result_schema.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AnalyzedStep(BaseModel):
    """분석된 풀이 단계 스키마"""
    step_index: int = Field(description="풀이 단계 순서(0부터 시작)")
    latex: str = Field(description="OCR로 변환된 LaTeX 텍스트")
    is_valid: bool = Field(description="해당 단계의 유효성 여부")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    feedback: Optional[str] = Field(default=None, description="해당 단계에 대한 피드백")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="추가 메타데이터")


class AnalysisResult(BaseModel):
    """분석 결과 스키마"""
    steps: List[AnalyzedStep] = Field(description="분석된 풀이 단계 목록")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="분석 결과에 대한 종합적인 메타데이터")
