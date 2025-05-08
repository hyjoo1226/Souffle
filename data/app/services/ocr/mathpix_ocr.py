# app/services/ocr/mathpix_ocr.py
import httpx
import os
import json
import tempfile
import re
import logging
from app.core.config import settings
from .base_ocr import BaseOCR, OCRResult
from app.core.exceptions import OCRError

# 로거 설정
logger = logging.getLogger(__name__)

class MathpixOCR(BaseOCR):
    async def image_to_latex(self, image_path: str) -> OCRResult:
        headers = {
            "app_id": settings.MATHPIX_APP_ID,
            "app_key": settings.MATHPIX_APP_KEY
        }

        options = {
            "rm_spaces": True,
            "math_inline_delimiters": ["$", "$"],
            "formats": ["text", "latex_styled", "asciimath"]
        }

        try:
            async with httpx.AsyncClient() as client:
                with open(image_path, "rb") as f:
                    files = {"file": (os.path.basename(image_path), f, "image/png")}
                    data = {"options_json": json.dumps(options)}

                    response = await client.post(
                        "https://api.mathpix.com/v3/text",
                        headers=headers,
                        files=files,
                        data=data,
                        timeout=60.0
                    )

            response.raise_for_status()
            result = response.json()

            logger.debug(f"[MathpixOCR] 응답 전체: {json.dumps(result, indent=2, ensure_ascii=False)}")

            latex = result.get("latex_styled") or result.get("text") or result.get("asciimath") or ""
            confidence = result.get("confidence", 0.0)
            
            # LaTeX 정제 및 형식 개선
            latex = self.clean_latex(latex)
            
            logger.info(f"[MathpixOCR] OCR 결과: '{latex}', 신뢰도: {confidence}")
            
            # 메타데이터 추출 (추후 분석에 유용할 수 있는 정보)
            metadata = {
                "detection_map": result.get("detection_map"),
                "error": result.get("error"),
                "latex_confidence": result.get("latex_confidence"),
                "position": result.get("position")
            }
            
            # 빈 값과 None 제거
            metadata = {k: v for k, v in metadata.items() if v}
            
            return OCRResult(latex=latex, confidence=confidence, metadata=metadata)

        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP 오류: {e.response.status_code} - {e.response.text}"
            logger.error(f"[MathpixOCR] {error_msg}")
            raise OCRError(message=error_msg, detail={"status_code": e.response.status_code})
        except Exception as e:
            error_msg = f"OCR 실패: {str(e)}"
            logger.error(f"[MathpixOCR] {error_msg}")
            raise OCRError(message=error_msg)
    
    def clean_latex(self, latex: str) -> str:
        """
        LaTeX 문자열을 정제하고 형식을 개선합니다.
        수식 처리 라이브러리가 더 잘 이해할 수 있는 형태로 변환합니다.
        """
        if not latex:
            return latex
            
        # 로깅 시작
        logger.debug(f"LaTeX 정제 전: {latex}")
        
        # 불필요한 공백 정리
        latex = re.sub(r'\s+', ' ', latex).strip()
        
        # 숫자와 변수 사이의 공백 제거 (예: "5 x" -> "5x")
        latex = re.sub(r'(\d+)\s+([a-zA-Z])', r'\1\2', latex)
        
        # x^{n} 형태 표준화
        latex = re.sub(r'x\^(\d+)', r'x^{\1}', latex)
        
        # \text{or} 표준화
        latex = re.sub(r'or', r'\\text { or }', latex)
        
        # 괄호 주변 공백 정리
        latex = re.sub(r'\(\s+', r'(', latex)
        latex = re.sub(r'\s+\)', r')', latex)
        
        # 등호 주변 공백 정리
        latex = re.sub(r'\s*=\s*', r'=', latex)
        
        # 로깅 종료
        logger.debug(f"LaTeX 정제 후: {latex}")
        
        return latex
