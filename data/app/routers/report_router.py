from fastapi import APIRouter, HTTPException, status
from app.models.report_schema import StudyAnalysisRequest, StudyAnalysisResponse, ScoreModel
from app.core.report import analyze_studying
from openai import OpenAIError

# /data/api/v1은 main에 이미 잇음
router = APIRouter(
    prefix="/report",
    tags=["report"]
)

@router.post("/latest", response_model=StudyAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_study_analysis(request: StudyAnalysisRequest):
    try:
        # ScoreModel을 리스트로 변환
        scores_list = request.scores.to_list()
        
        # 분석 실행
        result = analyze_studying({"scores": scores_list})
        
        if not result or "ai_diagnosis" not in result or "study_plan" not in result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="분석 결과가 올바르지 않습니다."
            )
        
        # 결과를 StudyAnalysisResponse 형식으로 변환
        response = StudyAnalysisResponse(
            ai_diagnosis=result["ai_diagnosis"],
            study_plan=result["study_plan"]
        )
        
        return response
        
    except OpenAIError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI 서비스에 일시적인 문제가 발생했습니다: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"분석 중 오류 발생! report_schema를 잘 확인할것: {str(e)}"
        )
