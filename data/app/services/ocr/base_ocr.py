# app/services/ocr/base_ocr.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class OCRResult:
    def __init__(self, latex: str, confidence: float = 0.0, metadata: Optional[Dict[str, Any]] = None):
        self.latex = latex
        self.confidence = confidence
        self.metadata = metadata or {}

class BaseOCR(ABC):
    @abstractmethod
    async def image_to_latex(self, image_path: str) -> OCRResult:
        """
        주어진 이미지 경로를 LaTeX 문자열로 변환합니다.
        반환값은 OCRResult 객체로, latex, confidence, metadata를 포함합니다.
        """
        pass
