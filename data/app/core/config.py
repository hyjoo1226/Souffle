from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OCR_BACKEND: str = "mathpix"
    MATHPIX_APP_ID: str
    MATHPIX_APP_KEY: str
    OPENAI_API_KEY: str
    DB_USERNAME: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_DATABASE: str
    REDIS_HOST: str
    REDIS_PORT: str
    
    # 임베딩 관련 설정
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    USE_SIMILARITY_ANALYSIS: bool = True
    ALWAYS_USE_LLM: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
