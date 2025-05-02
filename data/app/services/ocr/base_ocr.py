# app/services/ocr/base_ocr.py
from abc import ABC, abstractmethod

class BaseOCR(ABC):
    @abstractmethod
    async def image_to_latex(self, image_path: str) -> str:
        """
        주어진 이미지 경로를 LaTeX 문자열로 변환합니다.
        """
        pass
