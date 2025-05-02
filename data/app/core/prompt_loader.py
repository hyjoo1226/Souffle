# app/core/prompt_loader.py
import json
import os

PROMPT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '../../static/prompt_templates.json')
)

def load_prompt_template(grade: str) -> dict:
    """
    주어진 학년에 해당하는 GPT 프롬프트 템플릿을 로딩합니다.
    grade: "grade_1", "grade_2", "grade_3"
    """
    try:
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"[PromptLoader] 프롬프트 파일이 존재하지 않습니다: {PROMPT_PATH}")
        return {}
    except json.JSONDecodeError as e:
        print(f"[PromptLoader] JSON 파싱 오류: {e}")
        return {}
    except Exception as e:
        print(f"[PromptLoader] 알 수 없는 오류: {e}")
        return {}

    if grade not in data:
        print(f"[PromptLoader] 지정된 grade '{grade}'가 프롬프트 파일에 존재하지 않습니다.")
        return {}

    return data[grade]
