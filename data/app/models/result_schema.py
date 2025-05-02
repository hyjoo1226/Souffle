# app/models/result_schema.py
from pydantic import BaseModel
from typing import Optional, List


class AnalyzedStep(BaseModel):
    step_index: int
    latex: str
    is_valid: bool
    feedback: Optional[str] = None


class AnalysisResult(BaseModel):
    steps: List[AnalyzedStep]
