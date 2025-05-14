from fastapi import APIRouter
from datetime import datetime
from app.services import health_service

router = APIRouter(tags=["health"])

@router.get("/health")
async def get_health():
    components = {
        "fastapi": "ok",
        "postgresql": await health_service.check_postgres(),
        "redis": await health_service.check_redis(),
        "openai_api": await health_service.check_openai()
    }

    status = "ok" if all(v == "ok" for v in components.values()) else "degraded"

    return {
        "status": status,
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "components": components
    }

