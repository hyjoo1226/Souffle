# app/models/result_schema.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AnalyzedStep(BaseModel):
    step_index: int
    latex: str
    is_valid: bool
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="OCR 결과의 신뢰도")
    feedback: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AnalysisResult(BaseModel):
    steps: List[AnalyzedStep]
    metadata: Optional[Dict[str, Any]] = None
