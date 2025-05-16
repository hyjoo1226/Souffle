from fastapi import APIRouter, HTTPException
from app.models.report_schema import StudyAnalysisRequest
from app.core.report import analyze_studying
from openai import OpenAIError
from typing import List

# /data/api/v1은 main에 이미 잇음
router = APIRouter(
    prefix="/report",
    tags=["report"]
)

# 입력된 지표들 유효성 검증 함수수
def validate_scores(scores: List[float]) -> None:
    if len(scores) != 6:
        raise HTTPException(
            status_code=400,
            detail="정확히 6개의 점수가 필요합니다. (해결, 참여, 속도, 개선, 성실, 되새김 점수)"
        )
    
    for score in scores:
        if not isinstance(score, (int, float)):
            raise HTTPException(
                status_code=400,
                detail="모든 점수는 숫자여야 합니다."
            )
        if score < 0 or score > 100:
            raise HTTPException(
                status_code=400,
                detail="모든 점수는 0에서 100 사이여야 합니다."
            )


@router.post("/latest")
async def create_study_analysis(request: StudyAnalysisRequest):
    try:
        # 입력값 검증
        validate_scores(request.scores)
        
        # 분석 실행
        result = analyze_studying({"scores": request.scores})
        
        if not result or "ai_diagnosis" not in result or "study_plan" not in result:
            raise HTTPException(
                status_code=500,
                detail="분석 결과가 올바르지 않습니다."
            )
            
        return result
        
    except OpenAIError as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI 서비스에 일시적인 문제가 발생했습니다: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"분석 중 오류가 발생했습니다: {str(e)}"
        )
