# app/main.py
from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ocr_router

api_router = APIRouter(prefix="/data/api/v1")
api_router.include_router(ocr_router.router)

app = FastAPI(
    title="수플래 분석 서버",
    debug=True,
    description="수식 이미지 OCR 및 풀이 분석 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ API 라우터 등록
app.include_router(api_router)


# ✅ 루트 상태 체크 GET
@app.get("/")
async def root():
    return {"message": "수플래 분석 서버가 실행 중입니다."}


# ✅ POST 헬스 체크 (요청 그대로 응답)
@app.post("/health")
async def health_check(request: Request):
    body = await request.json()
    return body
