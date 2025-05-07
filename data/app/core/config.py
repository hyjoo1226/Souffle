# app/core/config.py
from pydantic_settings import BaseSettings  # ✅ 변경된 위치

class Settings(BaseSettings):
    OCR_BACKEND: str = "mathpix"
    MATHPIX_APP_ID: str
    MATHPIX_APP_KEY: str
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
