from openai import AsyncOpenAI
from pathlib import Path
import base64
import json
import argparse
import os

from app.core.config import settings  # settings에서 API 키를 가져오기 위해 추가

# OpenAI API 키는 환경변수 OPENAI_API_KEY에 설정되어 있어야 합니다.
api_key = settings.OPENAI_API_KEY
client = AsyncOpenAI(api_key=api_key)


def get_problem_id_from_filename(filename: str) -> str:
    return filename.split("_")[0].replace(".jpg", "")


def load_problem_explanation(problem_id: str, problem_json_path="problems.json") -> str:
    base_dir = os.path.dirname(__file__)  # 현재 파일 기준 경로
    full_path = os.path.join(base_dir, problem_json_path)
    with open(full_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for part in data:
        for lesson in part.get("lessons", []):
            for problem in lesson.get("problems", []):
                if problem.get("problem_id") == problem_id:
                    return (problem.get("question_lines", {}).get("line1", "[문제 없음]"), problem.get("explanation_lines", {}).get("line1", "[해설 없음]"))
                
    return "[문제 ID를 찾을 수 없음]"

async def encode_image_to_base64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()

async def analyze_step(problem: str, index: int, image_path: Path):
    image_base64 = await encode_image_to_base64(image_path)
    question, explanation = problem
    prompt = f"""
    # 수학문제 : 
    {question}
# 문제 해설 :
{explanation}
다음은 수학 문제 풀이의 {index+1}단계 스냅샷들입니다. 위의 수학 문제에 부합하는 풀이과정인지 문제 해설을 참고하여 다음과 같은 행동을 수행하세요
- 이전 풀이 흐름과 비교하여 어떤 과정인지 설명하세요.  
- 이 단계의 수식을 읽고 이 풀이가 논리적으로 타당한지 판단하세요.
- 오류나 누락이 있다면 간결하고 학습 친화적인 방식으로 설명해주세요.
"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "당신은 수학 문제를 단계적으로 분석하고 오류를 감지하는 학습 피드백 AI입니다."},
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {
                    "url": f"data:image/jpeg;base64,{image_base64}"}
                }
            ]}
        ],
        max_tokens=1024
    )

    return {
        "step": index + 1,
        "image": image_path.name,
        "analysis": response.choices[0].message.content
    }

# 인자로 맞았는지 or 틀렸는지랑 problem_id 받는다
def parse_args():
    parser = argparse.ArgumentParser(description="단계별 수학 풀이 이미지 분석기")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--correct", action="store_true", help="정답 풀이 분석")
    group.add_argument("--wrong", action="store_true", help="오답 풀이 분석")
    parser.add_argument("--problem_id", type=str, required=True, help="문제 ID (예: 25475-0010)")
    return parser.parse_args()

async def main():

# 문제 ID에 따라 경로 및 상태 설정
    args = parse_args()
    problem_id = args.problem_id
    problem = load_problem_explanation(problem_id=problem_id, problem_json_path="problems.json")
    print(problem)
    # 인자 받는 부분
    if args.correct:
        image_dir = "app/core/correct/"
        image_ext = ".jpg"
    elif args.wrong:
        image_dir = "app/core/wrong/"
        image_ext = ".jpg"


    image_paths = sorted(Path(image_dir).glob(f"*{image_ext}"))
    print(list(image_paths))
    print(f"[INFO] 분석할 이미지 {len(image_paths)}장 발견됨.")

    results = await asyncio.gather(
        *[analyze_step(problem, i, path) for i, path in enumerate(image_paths)]
    )

    # JSON으로 저장
    output_file = "step_analysis_output.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n✅ 전체 분석 완료. 결과 출력:\n")
    for r in results:
        print(f"📘 Step {r['step']} - {r['image']}")
        print(r["analysis"])
        print("-" * 80)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
