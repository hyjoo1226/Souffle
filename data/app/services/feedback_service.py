# app/services/feedback_service.py
from app.core.prompt_loader import load_prompt_template
from openai import AsyncOpenAI
import os

async def generate_feedback(prev_expr: str, curr_expr: str, step_number: int, grade: str) -> str:
    """
    GPT를 활용하여 수식 단계 오류에 대한 피드백 생성
    """
    try:
        template = load_prompt_template(grade)
        persona = template.get("persona", "")
        instruction = template.get("instruction", "")
        system_prompt = f"{persona}\n\n{instruction}".strip()

        filled_prompt = (
            f"[문제 풀이 분석]\n"
            f"- 단계 번호: {step_number}\n"
            f"- 이전 수식: {prev_expr}\n"
            f"- 현재 수식: {curr_expr}\n"
            f"\n위 수식의 변화에 대해 분석 지침에 따라 피드백을 작성해주세요."
        )

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.")
        client = AsyncOpenAI(api_key=api_key)

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": filled_prompt}
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"(피드백 생성 실패: {e})"
