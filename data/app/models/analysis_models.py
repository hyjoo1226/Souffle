from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AnalysisRequest:
    """수학 풀이 분석 요청 모델"""
    def __init__(self, images: List[bytes], metadata: Optional[Dict[str, Any]] = None):
        self.images = images
        self.metadata = metadata or {}

class AnalysisResponse:
    """수학 풀이 분석 응답 모델"""
    def __init__(
        self,
        latex_steps: List[str],
        validation_results: List[Dict[str, Any]],
        feedback: str,
        similar_problems: List[Dict[str, Any]],
        processing_time: float,
        error_details: Optional[Dict[str, Any]] = None
    ):
        self.latex_steps = latex_steps
        self.validation_results = validation_results
        self.feedback = feedback
        self.similar_problems = similar_problems
        self.processing_time = processing_time
        self.error_details = error_details
