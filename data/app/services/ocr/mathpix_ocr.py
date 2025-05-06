# app/services/ocr/mathpix_ocr.py
import httpx
import os
import json
import tempfile
from app.core.config import settings
from .base_ocr import BaseOCR, OCRResult
from app.core.exceptions import OCRError

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

            print("[MathpixOCR] 응답 전체:", json.dumps(result, indent=2, ensure_ascii=False))

            latex = result.get("latex_styled") or result.get("text") or result.get("asciimath") or ""
            confidence = result.get("confidence", 0.0)
            print(f"[MathpixOCR] OCR 결과: '{latex}', 신뢰도: {confidence}")
            
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
            print(f"[MathpixOCR] {error_msg}")
            raise OCRError(message=error_msg, detail={"status_code": e.response.status_code})
        except Exception as e:
            error_msg = f"OCR 실패: {str(e)}"
            print(f"[MathpixOCR] {error_msg}")
            raise OCRError(message=error_msg)
