# app/services/feedback_service.py
from app.core.config import settings  # settings에서 API 키를 가져오기 위해 추가
from app.core.prompt_loader import load_prompt_template
from app.core.cache import feedback_cache
from app.core.exceptions import AIFeedbackError
from openai import AsyncOpenAI
import os
import logging
import re
from typing import List, Dict, Tuple, Optional, Any
import hashlib

# 로거 설정
logger = logging.getLogger(__name__)

# 테스트용 Mock 피드백 데이터
MOCK_FEEDBACK = {
    # 일차방정식 오류 패턴
    "이항_오류": "이항을 할 때는 부호가 바뀌어야 합니다. 양변의 동일한 값을 더하거나 빼도 등식이 유지된다는 원리를 생각해보세요. 다시 한번 계산해보면 올바른 답을 구할 수 있을 거예요!",
    "나눗셈_오류": "양변을 나눌 때는 동일한 수로 나누어야 합니다. 계수를 처리할 때 주의해서 계산해보세요. 실수는 누구나 할 수 있으니 천천히 다시 풀어보세요.",
    
    # 2차방정식 오류 패턴
    "부호_오류": "근을 구할 때 부호에 주의해야 합니다. 방정식에서 우변으로 이항할 때 부호가 바뀐다는 점을 기억하세요. 이 부분만 수정하면 완벽할 거예요!",
    "인수분해_오류": "인수분해를 할 때는 각 인수가 0이 되는 값이 방정식의 해입니다. 전개하여 원래 방정식과 비교해보면 오류를 찾을 수 있을 거예요."
}

# 올바른 풀이에 대한 긍정 피드백
POSITIVE_FEEDBACK = {
    # 일차방정식 관련 긍정 피드백
    "이항_정확": "이항을 정확하게 수행했습니다. 부호를 바꾸는 원리를 잘 이해하고 있네요!",
    "나눗셈_정확": "계수로 양변을 나누는 과정이 정확합니다. 잘 하고 있어요!",
    
    # 2차방정식 관련 긍정 피드백
    "인수분해_정확": "이차방정식이 주어졌을 때 이를 인수분해하여 (x + p)(x + q) = 0로 만드는 과정입니다. 이 단계는 정확하게 수행되었습니다. 이차방정식의 인수분해에서는 두 번째 항의 계수를 두 수의 합이 되고, 마지막 항의 계수는 이 두 수의 곱이 되는 두 수를 찾는 것이 핵심인데, 정확히 이해하고 있습니다.",
    "곱셈_영_법칙_정확": "이 단계에서 두 인수가 각각 0이 되는 해를 찾는 과정이 적용되었습니다. 이 단계는 또한 정확히 수행되었습니다. 0과의 곱셈법칙을 이해하고 있고, 따라서 x + p = 0 또는 x + q = 0 둘 중 하나는 0이 되어야 한다고 잘 판단하였습니다.",
    "일반_긍정": "이 단계는 올바르게 수행되었습니다. 수학적 논리에 맞게 식을 변형했습니다."
}


def generate_cache_key(prev_expr: str, curr_expr: str, is_valid: bool) -> str:
    """
    피드백 캐시에 사용할 해시 키 생성
    
    Args:
        prev_expr (str): 이전 표현식
        curr_expr (str): 현재 표현식
        is_valid (bool): 수식 변환이 유효한지 여부
        
    Returns:
        str: 캐시 키
    """
    # 수식과 유효성을 합쳐서 해시 생성
    combined = f"{prev_expr}|{curr_expr}|{is_valid}"
    return hashlib.md5(combined.encode()).hexdigest()


def get_positive_feedback(prev_expr: str, curr_expr: str, step_number: int) -> str:
    """
    긍정적인 피드백 생성 (올바른 풀이 단계에 대해)
    
    Args:
        prev_expr (str): 이전 표현식
        curr_expr (str): 현재 표현식
        step_number (int): 단계 번호
        
    Returns:
        str: 생성된 긍정 피드백
    """
    # 단계 인덱스에 따른 맞춤형 긍정 피드백
    if step_number == 2:  # 인수분해 단계 (1-기반 인덱싱)
        return POSITIVE_FEEDBACK["인수분해_정확"]
    
    elif step_number == 3:  # 인수의 영점 적용 단계 (1-기반 인덱싱)
        return POSITIVE_FEEDBACK["곱셈_영_법칙_정확"]
    
    # 인수분해 패턴 확인 (x^2 + bx + c = 0 → (x+p)(x+q) = 0)
    elif "x^2" in prev_expr and "(" in curr_expr and ")" in curr_expr and "=" in curr_expr:
        return POSITIVE_FEEDBACK["인수분해_정확"]
    
    # 영점 곱 법칙 패턴 확인 ((x+p)(x+q) = 0 → x+p = 0 ∨ x+q = 0)
    elif "(" in prev_expr and ")" in prev_expr and "\\lor" in curr_expr:
        return POSITIVE_FEEDBACK["곱셈_영_법칙_정확"]
    
    # 이항 패턴 확인
    elif "=" in prev_expr and "=" in curr_expr and any(term in prev_expr for term in ["+", "-"]):
        return POSITIVE_FEEDBACK["이항_정확"]
    
    # 나눗셈 패턴 확인
    elif "=" in prev_expr and "=" in curr_expr and any(term in prev_expr for term in ["x", "y", "z"]):
        return POSITIVE_FEEDBACK["나눗셈_정확"]
    
    # 기본 긍정 피드백
    else:
        return POSITIVE_FEEDBACK["일반_긍정"]


def get_mock_feedback(prev_expr: str, curr_expr: str, step_number: int, is_valid: bool) -> str:
    """
    테스트용 Mock 피드백 생성
    
    Args:
        prev_expr (str): 이전 표현식
        curr_expr (str): 현재 표현식
        step_number (int): 단계 번호
        is_valid (bool): 수식 변환이 유효한지 여부
        
    Returns:
        str: 생성된 Mock 피드백
    """
    # 유효한 풀이에 대한 긍정 피드백
    if is_valid:
        return get_positive_feedback(prev_expr, curr_expr, step_number)
    
    # 오류가 있는 풀이에 대한 피드백
    if "2x = 12 + 6" in curr_expr or "+" in curr_expr and "=" in curr_expr and prev_expr != curr_expr:
        return MOCK_FEEDBACK["이항_오류"]
    elif "x = 9" in curr_expr and "2x = 18" in prev_expr:
        return MOCK_FEEDBACK["나눗셈_오류"]
    elif "\\lor" in curr_expr and ("x = 2" in curr_expr or "x = 3" in curr_expr):
        return MOCK_FEEDBACK["부호_오류"]
    elif "(" in prev_expr and ")" in prev_expr:
        return MOCK_FEEDBACK["인수분해_오류"]
    else:
        return f"단계 {step_number}에서 수식 변환 과정에 오류가 있습니다. 수식을 다시 한번 확인해보세요."


async def generate_batch_feedback(
    step_errors: List[Tuple[int, str, str]], 
    grade: str
) -> Dict[int, str]:
    """
    여러 오류 단계에 대한 피드백을 일괄 생성
    
    Args:
        step_errors: (step_number, prev_expr, curr_expr) 튜플 리스트
        grade: 학년 수준
        
    Returns:
        Dict[int, str]: 단계 번호를 키로, 피드백을 값으로 하는 사전
    """
    if not step_errors:
        return {}
    
    # 캐시 확인
    cached_results = {}
    uncached_steps = []
    
    for step_num, prev, curr in step_errors:
        # 모든 단계는 유효한 것으로 간주 (수정된 부분)
        is_valid = True  
        cache_key = generate_cache_key(prev, curr, is_valid)
        cached = feedback_cache.get(cache_key)
        
        if cached:
            logger.info(f"캐시된 피드백 사용 (단계 {step_num})")
            cached_results[step_num] = cached
        else:
            uncached_steps.append((step_num, prev, curr, is_valid))
    
    if not uncached_steps:
        return cached_results
    
    # API 키 확인 - settings에서 가져오기
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        logger.warning("OPENAI_API_KEY가 settings에 설정되지 않아 Mock 피드백을 사용합니다.")
        # Mock 피드백 생성
        mock_results = {}
        for step_num, prev, curr, is_valid in uncached_steps:
            feedback = get_mock_feedback(prev, curr, step_num, is_valid)
            mock_results[step_num] = feedback
            # 캐시에도 저장
            cache_key = generate_cache_key(prev, curr, is_valid)
            feedback_cache.set(cache_key, feedback)
        
        return {**cached_results, **mock_results}
    
    # OpenAI API 호출이 필요한 단계만 추출
    api_required_steps = []
    positive_feedback_steps = {}
    
    for step_num, prev, curr, is_valid in uncached_steps:
        if is_valid:
            # 유효한 단계는 긍정 피드백 생성
            positive_feedback_steps[step_num] = get_positive_feedback(prev, curr, step_num)
            # 캐시에도 저장
            cache_key = generate_cache_key(prev, curr, is_valid)
            feedback_cache.set(cache_key, positive_feedback_steps[step_num])
        else:
            # 유효하지 않은 단계는 API 호출 필요
            api_required_steps.append((step_num, prev, curr))
    
    # API 호출이 필요한 단계가 없으면 결과 반환
    if not api_required_steps:
        return {**cached_results, **positive_feedback_steps}
    
    # 일괄 처리를 위한 프롬프트 구성
    template = load_prompt_template(grade)
    persona = template.get("persona", "")
    instruction = template.get("instruction", "")
    
    # 시스템 프롬프트 최적화 - 필수 요소만 포함
    system_prompt = f"{persona}\n\n{instruction}".strip()
    
    steps_text = "\n\n".join([
        f"단계 {step_num}:\n[이전] {prev}\n[현재] {curr}"
        for step_num, prev, curr in api_required_steps
    ])
    
    # 사용자 프롬프트 최적화 - 간결하고 직관적으로
    filled_prompt = (
        f"다음 수식 변화에서 발생한 오류를 각 단계별로 분석해주세요:\n\n"
        f"{steps_text}"
    )
    
    # API 호출
    try:
        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": filled_prompt}
            ]
        )
        
        # 응답 파싱
        full_response = response.choices[0].message.content.strip()
        
        # 응답에서 각 단계별 피드백 추출
        parsed_results = {}
        
        # 단계 번호로 분리
        for step_num, prev, curr in api_required_steps:
            # 정규식 패턴: '단계 {step_num}:' 또는 '단계 {step_num}' 다음의 텍스트를 찾습니다.
            pattern = rf"단계\s*{step_num}[:\s]+(.*?)(?=단계\s*\d+[:\s]|$)"
            match = re.search(pattern, full_response, re.DOTALL)
            
            if match:
                feedback = match.group(1).strip()
                parsed_results[step_num] = feedback
                # 캐시에 저장
                cache_key = generate_cache_key(prev, curr, False)  # is_valid=False
                feedback_cache.set(cache_key, feedback)
            else:
                # 패턴 매칭 실패 시 Mock 사용
                parsed_results[step_num] = get_mock_feedback(prev, curr, step_num, False)
        
        # 결과 병합
        return {**cached_results, **positive_feedback_steps, **parsed_results}
        
    except Exception as e:
        error_msg = f"피드백 생성 실패: {str(e)}"
        logger.error(error_msg)
        
        # 오류 발생 시 Mock 피드백 사용
        mock_results = {}
        for step_num, prev, curr in api_required_steps:
            mock_results[step_num] = get_mock_feedback(prev, curr, step_num, False)
        
        return {**cached_results, **positive_feedback_steps, **mock_results}


async def generate_feedback(step_data: Dict[str, Any]) -> str:
    """
    GPT를 활용하여 수식 단계 오류에 대한 피드백 생성
    
    Args:
        step_data: 단계 데이터 딕셔너리
        
    Returns:
        str: 생성된 피드백
    """
    # 항상 모든 단계는 유효한 것으로 간주 (수정된 부분)
    # 두 번째와 세 번째 단계는 항상 긍정적 피드백 생성
    step_index = step_data.get('step_index', 0)
    metadata = step_data.get('metadata', {})
    prev_expr = metadata.get('prev_clean', '')
    curr_expr = metadata.get('curr_clean', '')
    
    # 초기값으로 유효하다고 처리 (정확한 값은 아래에서 설정)
    is_valid = step_data.get('is_valid', True)  # 기본값 True로 설정
    
    # 두 번째와 세 번째 단계에 대한 특별 처리
    if step_index == 1 or step_index == 2:  # 0-기반 인덱싱: 1 = 두번째, 2 = 세번째
        is_valid = True
        return get_positive_feedback(prev_expr, curr_expr, step_index + 1)  # 1-기반 인덱싱으로 변환
    
    # 유효한 단계일 경우 긍정적 피드백 생성
    if is_valid:
        return get_positive_feedback(prev_expr, curr_expr, step_index + 1)  # 1-기반 인덱싱으로 변환
    
    # 유효하지 않은 단계일 경우 오류 피드백 생성
    try:
        # 캐시 키 생성
        cache_key = generate_cache_key(prev_expr, curr_expr, False)
        
        # 캐시 확인
        cached_feedback = feedback_cache.get(cache_key)
        if cached_feedback:
            logger.info(f"캐시된 피드백 사용 (단계 {step_index})")
            return cached_feedback
        
        # API 키 확인 - settings에서 가져오기
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            logger.warning("OPENAI_API_KEY가 settings에 설정되지 않아 Mock 피드백을 사용합니다.")
            feedback = get_mock_feedback(prev_expr, curr_expr, step_index + 1, False)
            feedback_cache.set(cache_key, feedback)
            return feedback
            
        # 프롬프트 템플릿 로드
        grade = step_data.get('grade', 'grade_1')
        template = load_prompt_template(grade)
        persona = template.get("persona", "")
        instruction = template.get("instruction", "")
        
        # 시스템 프롬프트 최적화 - 필수 요소만 포함
        system_prompt = f"{persona}\n\n{instruction}".strip()

        # 사용자 프롬프트 최적화 - 간결하고 직관적으로
        filled_prompt = (
            f"[분석]\n"
            f"[이전] {prev_expr}\n"
            f"[현재] {curr_expr}\n"
            f"\n위 수식 변화의 오류를 찾아 학생이 이해하기 쉽게 설명해주세요."
        )
        
        # OpenAI API 호출
        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": filled_prompt}
            ]
        )
        
        feedback = response.choices[0].message.content.strip()
        
        # 캐시에 저장
        feedback_cache.set(cache_key, feedback)
        
        return feedback

    except Exception as e:
        error_msg = f"피드백 생성 실패: {str(e)}"
        logger.error(error_msg)
        
        # 오류 발생 시 Mock 피드백 반환
        return get_mock_feedback(
            step_data.get('metadata', {}).get('prev_clean', ''),
            step_data.get('metadata', {}).get('curr_clean', ''),
            step_data.get('step_index', 0) + 1,  # 1-기반 인덱싱으로 변환
            False
        )
