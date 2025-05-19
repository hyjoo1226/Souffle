# app/routers/ocr_router.py
from fastapi import APIRouter, Depends, Query, HTTPException
from app.models.ocr_schema import (
    AnswerOCRRequest, AnswerOCRResponse,
    AnalysisOCRRequest, AnalysisOCRResponse,
    StepValidationResult
)
from app.services.ocr import get_ocr_engine
from app.services.analysis_service import analyze_equation_steps
from app.services.result_saver import load_latest_analysis
from app.core.exceptions import error_to_http_exception, OCRError
import tempfile
import httpx
import os
import logging
import json
import re

# 로거 설정
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/answer", response_model=AnswerOCRResponse)
async def convert_answer_ocr(request: AnswerOCRRequest):
    """정답 이미지를 LaTeX로 변환하는 엔드포인트"""
    try:
        # Mathpix를 기본 엔진으로 사용
        ocr = get_ocr_engine("mathpix")

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
            confidence=result.confidence
        )
    except Exception as e:
        # 예외 처리
        raise error_to_http_exception(e)


@router.post("/analysis", response_model=AnalysisOCRResponse)
async def analyze_ocr_steps(request: AnalysisOCRRequest):
    """수학 풀이 단계를 분석하는 엔드포인트"""
    try:
        image_paths = []
        temp_files = []
        step_times = []

        # 각 단계 이미지 다운로드 및 시간 기록
        async with httpx.AsyncClient() as client:
            for step in request.steps:
                response = await client.get(str(step.step_image_url), timeout=20.0)
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
                temp_file.write(response.content)
                temp_file.close()
                image_paths.append(temp_file.name)
                temp_files.append(temp_file.name)
                step_times.append(step.step_time)  # 단위: 초(sec)

        # 문제 ID 가져오기
        problem_id = str(request.problem_id)

        # 수식 분석 수행 - 스냅샷 분석 방식 (시간 정보도 함께 전달)
        result = await analyze_equation_steps(
            image_paths=image_paths, 
            grade="grade_1",
            problem_id=problem_id,
            step_times=step_times,  # 단위: 초(sec)
            total_solve_time=request.total_solve_time,  # 단위: 초(sec)
            understand_time=request.understand_time,  # 단위: 초(sec)
            solve_time=request.solve_time,  # 단위: 초(sec)
            review_time=request.review_time  # 단위: 초(sec)
        )

        # 임시 파일 정리
        for path in temp_files:
            try:
                os.unlink(path)
            except Exception as e:
                logger.warning(f"임시 파일 삭제 실패: {e}")

        # 저장된 분석 결과로부터 ai_analysis와 weakness 가져오기
        try:
            # analyze_equation_steps 함수에서 추가로 설정한 속성 사용
            ai_analysis = getattr(result, "ai_analysis", "")
            weakness = getattr(result, "weakness", "")
            
            # 만약 ai_analysis와 weakness가 없는 경우, 저장된 파일에서 가져오기 시도
            if not ai_analysis or not weakness:
                # 가장 최근 저장된 분석 결과 파일 불러오기
                saved_analysis = load_latest_analysis(problem_id)
                
                # AI 분석 및 약점 데이터 추출
                ai_analysis = saved_analysis.get("metadata", {}).get("ai_analysis", "") or ai_analysis
                weakness = saved_analysis.get("metadata", {}).get("weakness", "") or weakness
                
                logger.info(f"저장된 분석 결과에서 AI 분석과 약점 정보 불러옴")
            
            # 가져온 값이 비어있는 경우 기본값 사용
            if not ai_analysis or ai_analysis == "":
                error_count = len([s for s in result.steps if not s.is_valid])
                ai_analysis = f"{error_count}개의 단계에서 오류가 발견되었습니다."
            if not weakness or weakness == "":
                weakness = "풀이 과정을 검토하고 피드백을 확인하세요."
        except Exception as e:
            logger.warning(f"분석 결과 가져오기 실패: {str(e)}")
            # 기본값 설정 - result에서 필드에 접근
            error_count = len([s for s in result.steps if not s.is_valid])
            ai_analysis = f"{error_count}개의 단계에서 오류가 발견되었습니다."
            weakness = "풀이 과정을 검토하고 피드백을 확인하세요."
        
        # 틀린 단계 집계
        incorrect = [s for s in result.steps if not s.is_valid]
        
        # Pydantic 모델 필드에서 값 가져오기
        ai_analysis = result.ai_analysis
        weakness = result.weakness
        
        # 첫 번째 오류 step_index를 step_number로 변환
        first_error_step_number = 0
        if result.first_error_step is not None:
            # 실제 오류가 발생한 첫 번째 단계 찾기
            step_found = False
            for step in result.steps:
                if not step.is_valid:
                    first_error_step_number = step.step_index + 1  # 0-based -> 1-based
                    step_found = True
                    break
                    
            # 찾지 못한 경우 기본값으로 0-based 인덱스에 +1
            if not step_found:
                first_error_step_number = result.first_error_step + 1
                
            # AI 분석에서 오류 단계 번호 추출해서 비교
            error_match = re.search(r"(\d+)\s*번째 단계에서 첫 오류", ai_analysis)
            if error_match:
                mentioned_step = int(error_match.group(1))
                if mentioned_step != first_error_step_number:
                    logger.warning(f"오류 단계 불일치: API={first_error_step_number}, 분석={mentioned_step}")
                    # AI 분석이 더 정확할 가능성이 높으므로 해당 값 사용
                    first_error_step_number = mentioned_step
            
        # result_schema.py에 맞춰서 응답 형식 변경
        return AnalysisOCRResponse(
            steps=[
                StepValidationResult(
                    step_number=s.step_index + 1, 
                    step_valid=s.is_valid,
                    latex=s.latex,
                    confidence=s.confidence,
                    feedback=s.step_feedback
                )
                for s in result.steps
            ],
            # 분석 결과에서 가져온 값 사용
            ai_analysis=ai_analysis,
            weakness=weakness,
            first_error_step=first_error_step_number,  # step_number 형식으로 변경
            metadata={
                "total_steps": len(result.steps),
                "error_count": len(incorrect),
                "problem_id": problem_id
            }
        )
    except Exception as e:
        # 예외 처리
        raise error_to_http_exception(e)


@router.get("/health")
async def ocr_health_check():
    """OCR 서비스 건강 상태 확인 엔드포인트"""
    return {"status": "ok", "service": "ocr"}
