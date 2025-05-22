import asyncpg, redis.asyncio as redis, httpx, os
import logging
from app.core.config import settings

DATABASE_URL = f"postgresql://{settings.DB_USERNAME}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_DATABASE}"
REDIS_URL = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
OPENAI_URL = "https://api.openai.com/v1/models"
OPENAI_API_KEY = settings.OPENAI_API_KEY

logger = logging.getLogger(__name__)

async def check_postgres():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute("SELECT 1")
        await conn.close()
        return "ok"
    except Exception as e:
        logger.warning(f"PostgreSQL check failed: {e}")
        return "fail"

async def check_redis():
    try:
        r = redis.from_url(REDIS_URL)
        await r.ping()
        return "ok"
    except:
        return "fail"

async def check_openai():
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            res = await client.get(OPENAI_URL, headers={"Authorization": f"Bearer {OPENAI_API_KEY}"})
            return "ok" if res.status_code == 200 else "degraded"
    except:
        return "fail"

