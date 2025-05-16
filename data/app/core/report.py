import random
import json

from openai import OpenAI
from pathlib import Path


from app.core.config import settings  # settings에서 API 키를 가져오기 위해 추가

# OpenAI API 키는 환경변수 OPENAI_API_KEY에 설정되어 있어야 합니다.
api_key = settings.OPENAI_API_KEY
client = OpenAI(api_key=api_key)
conversation_history = []

def analyze_studying(params:dict):
    params_str = json.dumps(params, ensure_ascii=False, indent=2)
    print(params_str)

    report_prompt = f"""
    아래는 한 학생의 학습 분석 지표입니다. 지표는 100점 만점이며, 수치는 백분율로 해석됩니다.

    1. 해결 점수: {params["scores"][0]}점
    2. 참여 점수: {params["scores"][1]}점
    3. 속도 점수: {params["scores"][2]}점
    4. 개선 점수: {params["scores"][3]}점
    5. 성실 점수: {params["scores"][4]}점
    6. 되새김 점수: {params["scores"][5]}점

    위 데이터를 종합적으로 분석하여, 아래 내용을 포함하는 자연스러운 리포트를 작성하세요.

    - 학습 성과 진단: 실력 수준 및 최근 성과
    - 학습 습관 평가: 참여도, 성실도, 복습 태도
    - 개선이 필요한 영역과 그 이유
    - 잘하고 있는 점 칭찬
    - 앞으로 실천하면 좋을 학습 전략 1~2가지
    - 어투는 문어체이나 따뜻하고 친절한한 톤으로 작성

    호칭은 사용자로 리포트는 점수를 명시하지 말고 3~5문장 정도의 자연스러운 문장으로 구성하세요.
    """
    # 맥락 유지를 위한 gpt와의 대화내역 생성
    conversation_history.extend([{"role": "system", "content": "당신은 사용자의 지난 1주일 간의 학습 지표를 바탕으로 피드백을 제공하는 분석리포트 제공 AI입니다."},
            {"role": "user", "content": report_prompt}])

    # 최초 응답 요청청
    report_response = client.chat.completions.create(
        model="gpt-4o",
        messages=conversation_history,
        max_tokens=1024
    )
    ai_diagnosis = report_response.choices[0].message.content
    
    # 학습계획 프롬프팅
    plan_prompt = """
    이전 대화 내용을 참고해서 세단계짜리 학습계획 설계해줘
    ### 응답예시:
    - 1단계 : 1단계 계획
    - 2단계 : 2단계 계획
    - 3단계 : 3단계 계획
    각 단계는 하나의 간결한 단문체 문장으로 출력해줘
    """
    # 대화내역에 이전 응답과 새 프롬프트 추가
    conversation_history.extend([{"role" : "assistant", "content" : ai_diagnosis},
                                {"role" : "user", "content" : plan_prompt}])

    # 학습계획 대화 호출
    plan_response = client.chat.completions.create(
        model="gpt-4o",
        messages=conversation_history,
        temperature=0.3,
        max_tokens=1024
    )
    study_plan = plan_response.choices[0].message.content

    return {
        "scores" : params,
        "ai_diagnosis": ai_diagnosis,
        "study_plan" : study_plan
    }


def main():

# 문제 ID에 따라 경로 및 상태 설정
    

    print(f"\n✅ 전체 분석 완료. 결과 출력:\n")
    scores = [random.randint(0,100) for _ in range(6)]
    print(scores)
    print(analyze_studying({"scores" : scores}))

if __name__ == "__main__":
    # python -m app.core.prompting --correct --problem_id 25475-0001
    # 1번의 맞는 경우를 피드백받겠따따
    
    main()



"""
prompt1
prompt = f
    다음 6가지 지표들은 지난 1주일 간의 학생의 학습데이터를 다음과 같은 방식으로 가공한 지표들입니다.
    각 지표들은 100점 만점이고 앞의 세 지표는 학습, 뒤의 세 지표는 복습관련 지표입니다다.
    1. 해결 점수 : 맞은 문제 수 / 사용자가 푼 문제수
    2. 참여 점수 : 사용자가 푼 문제 수*2 (100점 만점)
    3. 속도 점수 : 평균 풀이시간보다 빨리 정답을 제출한 문제 수 / 사용자가 푼 문제 수
    4. 개선 점수 : 사용자가 다시 풀기를 시도한 문제 개수 / 사용자의 오답 수
    5. 성실 점수 : 사용자가 오답노트를 작성한 문제 수 / 사용자의 오답 수
    6. 되새김 점수 : 사용자가 오답노트를 7일 이내에 추가한 개수 / 사용자의 오답 수
    
    현재 수준진단(단원별 정답률 같은)
    학습 습관 분석
    문제풀이 전략 분석
    개선 포인트 제시
    를 내포한 피드백 기반 동기부여
    아래는 사용자의 지표입니다:
{params_str}

다음 조건을 지켜서 분석해주세요:
1. 점수별 항목에 대한 세부 해설은 하지 마세요.
2. 전체적으로 학습과 복습 습관이 어떤지 종합적으로 평가해주세요.
3. 현재 학습 습관의 장점과 개선 방향을 간단하고 통합적인 서술로 제시해주세요.
4. 마지막에 실천 가능한 학습 조언을 2~3줄 요약으로 제시해주세요.

"""