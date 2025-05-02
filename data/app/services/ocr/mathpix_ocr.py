# app/services/ocr/mathpix_ocr.py
import httpx
import os
import json
import tempfile
from app.core.config import settings
from .base_ocr import BaseOCR

class MathpixOCR(BaseOCR):
    async def image_to_latex(self, image_path: str) -> str:
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
            print(f"[MathpixOCR] OCR 결과: '{latex}'")
            return latex

        except httpx.HTTPStatusError as e:
            print(f"[MathpixOCR] HTTP 오류: {e.response.status_code} - {e.response.text}")
            return ""
        except Exception as e:
            print(f"[MathpixOCR] OCR 실패: {e}")
            return ""
