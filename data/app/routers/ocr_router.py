# app/routers/ocr_router.py
from fastapi import APIRouter, Depends, Query, HTTPException
from app.models.ocr_schema import (
    AnswerOCRRequest, AnswerOCRResponse,
    AnalysisOCRRequest, AnalysisOCRResponse,
    StepValidationResult, OCREngineType, AnalysisMetadata
)
from app.services.ocr import get_ocr_engine
from app.services.analysis_service import analyze_equation_steps
from app.core.exceptions import error_to_http_exception, OCRError
import tempfile
import httpx
import os
import logging
import time

# 로거 설정
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/answer", response_model=AnswerOCRResponse)
async def convert_answer_ocr(request: AnswerOCRRequest):
    """정답 이미지를 LaTeX로 변환하는 엔드포인트"""
    try:
        # 요청에서 엔진 타입 추출 또는 기본값 사용
        ocr = get_ocr_engine(request.engine)

        async with httpx.AsyncClient() as client:
            res = await client.get(str(request.answer_image_url))

        # 임시 파일 생성
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_file.write(res.content)
        temp_file.close()

        # OCR 처리
        result = await ocr.image_to_latex(temp_file.name)
        
        # 임시 파일 정리
        try:
            os.unlink(temp_file.name)
        except Exception as e:
            logger.warning(f"임시 파일 삭제 실패: {e}")
        
        # 응답 반환
        return AnswerOCRResponse(
            answer_convert=result.latex,
            confidence=result.confidence,
            engine_used=request.engine.value if request.engine else "mathpix"
        )
    except Exception as e:
        # 예외 처리
        raise error_to_http_exception(e)


@router.post("/analysis", response_model=AnalysisOCRResponse)
async def analyze_ocr_steps(request: AnalysisOCRRequest):
    """수학 풀이 단계를 분석하는 엔드포인트"""
    try:
        start_time = time.time()
        image_paths = []
        temp_files = []

        # 각 단계 이미지 다운로드
        async with httpx.AsyncClient() as client:
            for step in request.steps:
                response = await client.get(str(step.step_image_url), timeout=20.0)
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
                temp_file.write(response.content)
                temp_file.close()
                image_paths.append(temp_file.name)
                temp_files.append(temp_file.name)

        # 학년 정보 및 문제 ID 설정
        grade = request.grade if request.grade else "grade_1"
        problem_id = request.problem_id if request.problem_id else "unknown_problem"
                
        # 로그에 분석 요청 정보 기록
        logger.info(f"분석 요청: 학년={grade}, 문제ID={problem_id}, 단계 수={len(image_paths)}")
        
        # 수식 분석 수행 - 개선된 버전 호출
        result = await analyze_equation_steps(
            image_paths=image_paths, 
            grade=grade, 
            engine_type=request.engine,
            problem_id=problem_id
        )

        # 임시 파일 정리
        for path in temp_files:
            try:
                os.unlink(path)
            except Exception as e:
                logger.warning(f"임시 파일 삭제 실패: {e}")

        # 틀린 단계 집계
        incorrect = [s for s in result.steps if not s.is_valid]
        
        # 학년 기반 메시지 맞춤화
        grade_text = "이차방정식" if "3" in grade else "일차방정식"
        ai_analysis = f"{len(incorrect)}개의 단계에서 오류가 발견되었습니다."
        
        # 약점 분석 메시지 맞춤화
        if not incorrect:
            weakness = f"풀이 흐름에 논리적인 문제가 없어 보입니다. {grade_text} 해결 능력이 우수합니다."
        elif "3" in grade:  # 중3 (이차방정식)
            weakness = "인수분해와 영 곱셈 법칙 적용에 어려움이 있을 수 있습니다."
        else:  # 중1 (일차방정식)
            weakness = "이항 또는 나눗셈 개념 적용에 오류가 있을 수 있습니다."
        
        # 분석 시간 계산
        analysis_time = time.time() - start_time

        # 메타데이터 생성
        metadata = AnalysisMetadata(
            total_steps=len(result.steps),
            error_count=len(incorrect),
            problem_id=problem_id,
            grade=grade,
            engine=request.engine.value if request.engine else "mathpix",
            analysis_type="text",
            analysis_time=analysis_time,
            extra_info={
                "total_solve_time": request.total_solve_time,
                "understand_time": request.understand_time,
                "solve_time": request.solve_time,
                "review_time": request.review_time
            }
        )

        # 응답 반환
        return AnalysisOCRResponse(
            steps=[
                StepValidationResult(
                    step_number=s.step_index + 1, 
                    step_valid=s.is_valid,
                    latex=s.latex,
                    confidence=getattr(s, 'confidence', 0.0),
                    feedback=s.feedback if hasattr(s, 'feedback') else None
                )
                for s in result.steps
            ],
            ai_analysis=ai_analysis,
            weakness=weakness,
            engine_used=request.engine.value if request.engine else "mathpix",
            metadata=metadata
        )
    except Exception as e:
        # 예외 처리
        logger.error(f"분석 엔드포인트 오류: {str(e)}")
        raise error_to_http_exception(e)


@router.get("/health")
async def ocr_health_check():
    """OCR 서비스 건강 상태 확인 엔드포인트"""
    return {"status": "ok", "service": "ocr"}
