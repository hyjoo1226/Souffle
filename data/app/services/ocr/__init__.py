# app/services/ocr/__init__.py
from app.core.config import settings
from .mathpix_ocr import MathpixOCR
# from .custom_ocr import CustomOCR (추후 사용 예정)

def get_ocr_engine():
    if settings.OCR_BACKEND == "custom":
        raise NotImplementedError("Custom OCR is not implemented yet.")
    return MathpixOCR()
