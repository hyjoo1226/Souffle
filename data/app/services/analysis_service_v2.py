# app/services/analysis_service_v2.py
from typing import List, Dict, Optional, Tuple, Any
import logging
import json
import os
from pathlib import Path
import openai
from app.core.config import settings

# 로거 설정
logger = logging.getLogger(__name__)

# 환경 변수에서 OpenAI API 키 설정
openai.api_key = settings.OPENAI_API_KEY

class AnalysisServiceV2:
    """
    OpenAI API를 활용하여 수학 풀이에 대한 피드백을 제공하는
    분석 서비스 클래스 (v2)
    """
    
    def __init__(self):
        """
        AnalysisServiceV2 초기화
        """
        self.static_dir = Path(os.path.join("static", "csvjson.json"))
        self.problem_data = self._load_problem_data()
    
    def _load_problem_data(self) -> Dict:
        """
        문제 데이터 로드
        
        Returns:
            Dict: 문제 ID를 키로 하는 문제 데이터 딕셔너리
        """
        try:
            with open(self.static_dir, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # 문제 ID를 키로 하는 딕셔너리로 변환
            problem_dict = {}
            for item in data:
                row = item.get('row_to_json', {})
                problem_id = row.get('problemNo')
                if problem_id:
                    problem_dict[problem_id] = row
            
            logger.info(f"문제 데이터 로드 완료: {len(problem_dict)} 개")
            return problem_dict
        except Exception as e:
            logger.error(f"문제 데이터 로드 실패: {str(e)}")
            return {}
    
    def get_problem_info(self, problem_id: str) -> Dict:
        """
        문제 ID에 해당하는 문제 정보 조회
        
        Args:
            problem_id (str): 문제 ID
            
        Returns:
            Dict: 문제 정보
        """
        return self.problem_data.get(problem_id, {})
    
    async def generate_feedback(self, problem_id: str, steps: List[Dict], first_error_step: Optional[int] = None) -> Dict:
        """
        OpenAI API를 활용하여 풀이 과정에 대한 피드백 생성
        
        Args:
            problem_id (str): 문제 ID
            steps (List[Dict]): 풀이 단계별 정보
            first_error_step (Optional[int]): 첫 번째 오류 단계 인덱스 (1-based)
            
        Returns:
            Dict: AI 분석 결과와 약점 정보를 포함하는 딕셔너리
        """
        try:
            # 문제 정보 조회
            problem_info = self.get_problem_info(problem_id)
            if not problem_info:
                logger.warning(f"문제 정보가 없습니다: {problem_id}")
                return {
                    "ai_analysis": "문제 정보를 찾을 수 없습니다.",
                    "weakness": "문제 정보를 바탕으로 한 약점 분석을 제공할 수 없습니다."
                }
            
            # 프롬프트 생성
            prompt = self._create_prompt(problem_info, steps, first_error_step)
            
            # OpenAI API 호출
            response = await self._call_openai_api(prompt)
            
            # 응답 파싱
            result = self._parse_response(response)
            
            logger.info(f"피드백 생성 완료: {problem_id}")
            return result
        
        except Exception as e:
            logger.error(f"피드백 생성 실패: {str(e)}")
            return {
                "ai_analysis": f"피드백 생성 중 오류가 발생했습니다: {str(e)}",
                "weakness": "피드백 생성에 실패했습니다."
            }
    
    def _create_prompt(self, problem_info: Dict, steps: List[Dict], first_error_step: Optional[int]) -> str:
        """
        OpenAI API 호출을 위한 프롬프트 생성
        
        Args:
            problem_info (Dict): 문제 정보
            steps (List[Dict]): 풀이 단계별 정보
            first_error_step (Optional[int]): 첫 번째 오류 단계 인덱스 (1-based)
            
        Returns:
            str: 생성된 프롬프트
        """
        # 문제 정보 추출
        problem_content = problem_info.get('content', '문제 내용이 없습니다.')
        problem_explanation = problem_info.get('explanation', '해설이 없습니다.')
        problem_answer = problem_info.get('answer', '정답이 없습니다.')
        
        # 단계별 정보 포맷팅
        steps_text = ""
        for i, step in enumerate(steps):
            step_number = step.get('step_number', i+1)
            latex = step.get('latex', '')
            is_valid = step.get('step_valid', True)
            feedback = step.get('feedback', '')
            
            validity_str = "유효함" if is_valid else "오류 있음"
            steps_text += f"단계 {step_number}: {latex}\n상태: {validity_str}\n피드백: {feedback}\n\n"
        
        # 첫 번째 오류 단계 정보 추가
        error_step_info = ""
        if first_error_step:
            error_step_info = f"첫 번째 오류가 발생한 단계: {first_error_step}\n\n"
        
        # 프롬프트 템플릿
        prompt = f"""
당신은 중학생의 수학 풀이를 분석하고 친절한 피드백을 제공하는 전문가입니다.
아래 정보를 바탕으로 학생의 풀이를 분석하고, 맞춤형 피드백과 약점 분석을 제공해주세요.

### 문제 정보
문제: {problem_content}
정답: {problem_answer}
해설: {problem_explanation}

### 학생의 풀이 과정
{error_step_info}
{steps_text}

### 요청사항
1. 학생의 풀이 과정을 종합적으로 분석해주세요.
2. 오류가 있다면 어떤 부분에서 오류가 발생했는지, 왜 그런 오류가 발생했는지 친절하게 설명해주세요.
3. 학생이 개선할 수 있는 약점을 구체적으로 분석해 주세요.

### 출력 형식
다음 두 항목으로 나누어 응답해주세요:
1. 종합 분석: (학생의 풀이 과정에 대한 전반적인 분석)
2. 약점 분석: (학생이 개선해야 할 약점에 대한 구체적인 조언)
"""
        
        return prompt
    
    async def _call_openai_api(self, prompt: str) -> str:
        """
        OpenAI API 호출
        
        Args:
            prompt (str): API 호출에 사용할 프롬프트
            
        Returns:
            str: API 응답 텍스트
        """
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",  # 또는 사용 가능한 최신 모델
                messages=[
                    {"role": "system", "content": "당신은 중학생의 수학 풀이를 분석하고 친절한 피드백을 제공하는 전문가입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # 응답의 창의성 정도 (낮을수록 일관된 응답)
                max_tokens=1000,  # 응답의 최대 길이
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API 호출 실패: {str(e)}")
            raise
    
    def _parse_response(self, response: str) -> Dict:
        """
        API 응답 파싱
        
        Args:
            response (str): API 응답 텍스트
            
        Returns:
            Dict: 파싱된 결과
        """
        # 기본값 설정
        result = {
            "ai_analysis": "",
            "weakness": ""
        }
        
        try:
            # 응답에서 '종합 분석'과 '약점 분석' 부분 추출
            if "종합 분석:" in response:
                parts = response.split("종합 분석:")
                if len(parts) > 1:
                    content = parts[1]
                    
                    if "약점 분석:" in content:
                        analysis_parts = content.split("약점 분석:")
                        result["ai_analysis"] = analysis_parts[0].strip()
                        result["weakness"] = analysis_parts[1].strip()
                    else:
                        result["ai_analysis"] = content.strip()
            
            # 종합 분석이 없는 경우 전체 응답을 종합 분석으로 사용
            if not result["ai_analysis"]:
                result["ai_analysis"] = response.strip()
            
            return result
            
        except Exception as e:
            logger.error(f"응답 파싱 실패: {str(e)}")
            return {
                "ai_analysis": response.strip(),
                "weakness": "응답 파싱 중 오류가 발생했습니다."
            }


# 비동기 서비스 인스턴스 생성 함수
async def get_analysis_service_v2():
    """
    AnalysisServiceV2 인스턴스 생성
    
    Returns:
        AnalysisServiceV2: 분석 서비스 인스턴스
    """
    return AnalysisServiceV2()


# 분석 래퍼 함수
async def analyze_with_openai(problem_id: str, steps: List[Dict], first_error_step: Optional[int] = None) -> Dict:
    """
    OpenAI를 사용한 분석 수행
    
    Args:
        problem_id (str): 문제 ID
        steps (List[Dict]): 풀이 단계별 정보
        first_error_step (Optional[int]): 첫 번째 오류 단계 인덱스 (1-based)
    
    Returns:
        Dict: AI 분석 결과 (ai_analysis, weakness 포함)
    """
    service = await get_analysis_service_v2()
    return await service.generate_feedback(problem_id, steps, first_error_step)
