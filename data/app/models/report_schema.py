from typing import List, Optional
from pydantic import BaseModel

class StudyAnalysisRequest(BaseModel):
    scores: List[float]
