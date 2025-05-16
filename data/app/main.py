# app/main.py
from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ocr_router, health_router, report_router
from app.core.logging import setup_logging
from app.core.exceptions import error_to_http_exception
import logging

# 로깅 설정
setup_logging(log_level=logging.INFO)
logger = logging.getLogger(__name__)

# API 라우터 설정
api_router = APIRouter(prefix="/data/api/v1")
api_router.include_router(ocr_router.router)
api_router.include_router(health_router.router)
api_router.include_router(report_router.router)
# FastAPI 앱 생성
app = FastAPI(
    title="수플래 분석 서버",
    debug=True,
    description="수식 이미지 OCR 및 풀이 분석 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router)

# 전역 예외 처리기
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    전역 예외 처리기: 모든 처리되지 않은 예외를 표준화된 응답으로 변환
    """
    logger.error(f"처리되지 않은 예외: {str(exc)}", exc_info=True)
    return error_to_http_exception(exc)

# 루트 상태 체크 GET
@app.get("/")
async def root():
    """서버 상태 확인용 루트 엔드포인트"""
    logger.info("루트 엔드포인트 호출")
    return {"message": "수플래 분석 서버가 실행 중입니다.", "version": "1.0.0"}

# POST 헬스 체크 (요청 그대로 응답)
# @app.post("/health")
# async def health_check(request: Request):
#     """상세 헬스 체크 엔드포인트 (요청을 그대로 응답)"""
#     body = await request.json()
#     logger.info(f"헬스 체크 호출: {body}")
#     return body

# 시작 로그
logger.info("수플래 분석 서버 시작")
