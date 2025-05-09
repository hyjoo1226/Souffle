# app/core/exceptions.py
from fastapi import HTTPException
from typing import Dict, Any, Optional

class OCRError(Exception):
    """OCR 처리 중 발생한 오류"""
    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        self.message = message
        self.detail = detail or {}
        super().__init__(self.message)

class MathParsingError(Exception):
    """수식 파싱 중 발생한 오류"""
    def __init__(self, message: str, expr: str, detail: Optional[Dict[str, Any]] = None):
        self.message = message
        self.expr = expr
        self.detail = detail or {}
        super().__init__(f"{self.message}: {self.expr}")

class StepValidationError(Exception):
    """수식 단계 검증 중 발생한 오류"""
    def __init__(self, message: str, prev_expr: str, curr_expr: str, detail: Optional[Dict[str, Any]] = None):
        self.message = message
        self.prev_expr = prev_expr
        self.curr_expr = curr_expr
        self.detail = detail or {}
        super().__init__(f"{self.message}: {self.prev_expr} -> {self.curr_expr}")

class AIFeedbackError(Exception):
    """AI 피드백 생성 중 발생한 오류"""
    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        self.message = message
        self.detail = detail or {}
        super().__init__(self.message)

# 에러 코드 매핑
ERROR_RESPONSES = {
    OCRError: {"status_code": 422, "code": "OCR_PROCESSING_ERROR"},
    MathParsingError: {"status_code": 422, "code": "MATH_PARSING_ERROR"},
    StepValidationError: {"status_code": 422, "code": "STEP_VALIDATION_ERROR"},
    AIFeedbackError: {"status_code": 422, "code": "AI_FEEDBACK_ERROR"},
}

def error_to_http_exception(error: Exception) -> HTTPException:
    """커스텀 예외를 HTTPException으로 변환"""
    for error_type, response in ERROR_RESPONSES.items():
        if isinstance(error, error_type):
            return HTTPException(
                status_code=response["status_code"],
                detail={
                    "code": response["code"],
                    "message": str(error),
                    "detail": getattr(error, "detail", {})
                }
            )
    
    # 기본 서버 오류
    return HTTPException(
        status_code=500,
        detail={
            "code": "INTERNAL_SERVER_ERROR",
            "message": str(error),
        }
    )