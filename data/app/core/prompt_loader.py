# app/core/prompt_loader.py
import json
import os
from typing import Dict, Any
import logging

# 로거 설정
logger = logging.getLogger(__name__)

# 기본 프롬프트 템플릿
DEFAULT_TEMPLATE = {
    "persona": """
    당신은 대한민국 중학생 수학 풀이를 돕는 친절한 AI 선생님입니다. 학생이 이해하기 쉽게 설명하며, 
    오류가 있을 때 비난하지 않고 격려하는 방식으로 피드백을 제공합니다.
    """,
    "instruction": """
    수식 변환 과정에서 발생한 오류를 분석하고 다음과 같은 방식으로 피드백을 제공해 주세요:
    
    1. 어떤 오류가 있는지 간단히 요약 (한 문장)
    2. 왜 이것이 오류인지 설명 (1-2문장)
    3. 올바른 풀이 방법 제안 (1-2문장)
    4. 격려의 말로 마무리 (한 문장)
    
    중학생이 이해할 수 있는 쉬운 언어로 설명해 주세요.
    """
}

def load_prompt_template(grade: str = "grade_1") -> Dict[str, Any]:
    """
    지정된 학년에 맞는 프롬프트 템플릿을 로드합니다.
    
    Args:
        grade (str): 학년 코드 (grade_1, grade_2, grade_3)
        
    Returns:
        Dict[str, Any]: 프롬프트 템플릿 사전
    """
    # 먼저 static 폴더의 prompt_templates.json 파일을 확인
    templates_path = os.path.join(os.getcwd(), "static", "prompt_templates.json")
    
    try:
        if os.path.exists(templates_path):
            with open(templates_path, "r", encoding="utf-8") as f:
                templates = json.load(f)
                
                if grade in templates:
                    logger.info(f"프롬프트 템플릿 로드 성공: {grade}")
                    return templates[grade]
                else:
                    logger.warning(f"요청한 학년({grade}) 템플릿이 없습니다. 기본 템플릿 사용")
                    return DEFAULT_TEMPLATE
        else:
            # 백업 경로: grade별 개별 파일
            grade_template_path = os.path.join(os.getcwd(), "static/prompts", f"{grade}_prompt.json")
            
            if os.path.exists(grade_template_path):
                with open(grade_template_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                logger.warning(f"템플릿 파일을 찾을 수 없음: {templates_path}, 기본 템플릿 사용")
                return DEFAULT_TEMPLATE
    except Exception as e:
        logger.error(f"템플릿 로드 오류: {str(e)}, 기본 템플릿 사용")
        return DEFAULT_TEMPLATE
