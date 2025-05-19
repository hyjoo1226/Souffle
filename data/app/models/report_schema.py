from typing import List, Dict, Optional
from pydantic import BaseModel, Field

##
# 내부 scores 모델 정의
class ScoreModel(BaseModel):
    correct_score: float = Field(..., ge=0, le=100, description="해결 점수")
    participation_score: float = Field(..., ge=0, le=100, description="참여 점수")
    speed_score: float = Field(..., ge=0, le=100, description="속도 점수")
    review_score: float = Field(..., ge=0, le=100, description="개선 점수")
    sincerity_score: float = Field(..., ge=0, le=100, description="성실 점수")
    reflection_score: float = Field(..., ge=0, le=100, description="되새김 점수")

    def to_list(self) -> List[float]:
        return [
            self.correct_score,
            self.participation_score,
            self.speed_score,
            self.review_score,
            self.sincerity_score,
            self.reflection_score
        ]

class StudyAnalysisRequest(BaseModel):
    scores: ScoreModel

# StudyPlan 항목 모델
class PlanItem(BaseModel):
    step: int
    content: str

# 전체 Response 모델
class StudyAnalysisResponse(BaseModel):
    ai_diagnosis: str
    study_plan: List[dict]
