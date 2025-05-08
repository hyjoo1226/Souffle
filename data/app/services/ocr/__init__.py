# app/services/ocr/__init__.py
from app.core.config import settings
from app.core.exceptions import OCRError
from .mathpix_ocr import MathpixOCR
from .sumen_base import predict_latex_from_images
# from .trocr_ocr import TrOCR  # 추후 구현

def get_ocr_engine(engine_type=None):
    """
    OCR 엔진 팩토리 함수
    engine_type이 None이면 설정에서 기본값을 사용
    
    Args:
        engine_type (str, optional): 사용할 OCR 엔진 유형 ('mathpix', 'trocr' 등)
        
    Returns:
        BaseOCR: 선택된 OCR 엔진 인스턴스
        
    Raises:
        OCRError: 지원되지 않는 엔진 유형일 경우
    """
    engine = engine_type or settings.OCR_BACKEND
    
    if engine == "mathpix":
        return MathpixOCR()
    # elif engine == "trocr":
    #     return TrOCR()
    else:
        raise OCRError(f"지원되지 않는 OCR 엔진: {engine}")
    
def img_to_latex(paths):
    return predict_latex_from_images(paths)
