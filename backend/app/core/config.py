from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nigraan (نگران) — Civic Intelligence Copilot"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    
    # Supabase Credentials
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Multimodal LLMs
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ALIBABA_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.6-27b"
    GEMINI_MODEL: str = "gemini-3.1-flash-lite"
    ALIBABA_MODEL: str = "qwen-3.8-27B"
    
    # Server & CORS
    PORT: int = 8008
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    @field_validator("CORS_ORIGINS")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
