# app/services/ai_analysis_service.py
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.models.result_schema import AnalyzedStep
from openai import AsyncOpenAI
import logging
import re

# 로거 설정
logger = logging.getLogger(__name__)

class AIAnalysisService:
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
        self.model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
        
    async def generate_comprehensive_analysis(
        self, 
        steps: List[AnalyzedStep], 
        first_error_step: Optional[int],
        step_times: List[int] = None,
        total_solve_time: int = None,
        understand_time: int = None,
        solve_time: int = None,
        review_time: int = None
    ) -> Dict[str, str]:
        """
        문제 풀이에 대한 종합 분석 생성
        
        Args:
            steps: 분석된 풀이 단계 목록
            first_error_step: 첫 번째 오류 단계
            step_times: 각 단계별 풀이 시간 (초)
            total_solve_time: 총 풀이 시간 (초)
            understand_time: 문제 이해 시간 (초)
            solve_time: 문제 풀이 시간 (초)
            review_time: 문제 검토 시간 (초)
            
        Returns:
            ai_analysis와 weakness 정보가 담긴 딕셔너리
        """
        try:
            if not self.openai_api_key:
                # API 키가 없는 경우 기본 메시지 반환
                return self._generate_mock_analysis(steps, first_error_step)
                
            # 단계별 정보 추출 및 프롬프트 준비
            steps_info = []
            incorrect_steps = []
            low_confidence_steps = []
            
            for i, step in enumerate(steps):
                step_info = {
                    "step_number": i + 1,
                    "latex": step.latex,
                    "is_valid": step.is_valid,
                    "confidence": step.confidence,
                    "feedback": step.step_feedback,
                    "time": step_times[i] if step_times and i < len(step_times) else None
                }
                
                steps_info.append(step_info)
                
                if not step.is_valid:
                    incorrect_steps.append(i + 1)
                
                if step.confidence < 0.9:
                    low_confidence_steps.append(i + 1)
            
            # 시간 분석 정보
            time_info = {
                "total_solve_time": total_solve_time,
                "understand_time": understand_time,
                "solve_time": solve_time, 
                "review_time": review_time,
                "step_times": step_times if step_times else []
            }
            
            # 각각의 분석을 별도로 수행
            ai_analysis = await self._generate_ai_analysis(steps_info, incorrect_steps, first_error_step)
            weakness = await self._generate_weakness_analysis(steps_info, time_info, incorrect_steps, low_confidence_steps)
            
            return {
                "ai_analysis": ai_analysis,
                "weakness": weakness
            }
            
        except Exception as e:
            logger.error(f"AI 분석 생성 중 오류 발생: {str(e)}")
            return {
                "ai_analysis": "분석 중 오류가 발생했습니다.",
                "weakness": "분석 중 오류가 발생했습니다."
            }
    
    def _generate_mock_analysis(self, steps: List[AnalyzedStep], first_error_step: Optional[int]) -> Dict[str, str]:
        """API 키가 없을 때 기본 분석 제공"""
        incorrect_count = sum(1 for s in steps if not s.is_valid)
        
        ai_analysis = f"총 {len(steps)}개의 단계 중 {incorrect_count}개의 단계에서 오류가 발견되었습니다."
        if first_error_step is not None:
            ai_analysis += f" 첫 번째 오류는 {first_error_step}번째 단계에서 발생했습니다."
        
        weakness = "풀이 과정에서 오류가 발견되었습니다." if incorrect_count > 0 else "풀이 흐름에 논리적인 문제가 없어 보입니다."
        
        return {
            "ai_analysis": ai_analysis,
            "weakness": weakness
        }
        
    async def _generate_ai_analysis(
        self, 
        steps_info: List[Dict[str, Any]], 
        incorrect_steps: List[int],
        first_error_step: Optional[int]
    ) -> str:
        """AI 분석 생성: 오류 단계와 오류 유형 분석"""
        # 오류가 없는 경우
        if not incorrect_steps:
            return "모든 단계가 올바르게 풀이되었습니다. 훌륭합니다!"
            
        # 오류가 있는 경우 상세 분석 수행
        system_prompt = """
당신은 대한민국 고등학생 수학 풀이를 분석하는 수학 교육 전문가입니다. 
학생의 풀이 과정에서 발생한 오류를 분석하고, 오류 유형을 파악하여 
명확하고 교육적인 피드백을 제공해야 합니다.
"""

        # 프롬프트 구성
        steps_text = ""
        for step in steps_info:
            valid_text = "올바름" if step["is_valid"] else "오류"
            steps_text += f"\n단계 {step['step_number']}: {step['latex']} ({valid_text})"
            if not step["is_valid"]:
                steps_text += f"\n  - 피드백: {step['feedback']}"
                
        first_error = first_error_step if first_error_step is not None else None
        
        user_prompt = f"""
학생의 수학 풀이 단계를 분석해주세요:

{steps_text}

총 {len(steps_info)}개의 단계 중 {len(incorrect_steps)}개의 단계에서 오류가 발견되었습니다.
첫 번째 오류는 {first_error}번째 단계에서 발생했습니다.

다음 내용을 포함하여 ai_analysis를 작성해주세요:
1. 총 몇 개의 단계에서 몇 번째 단계에서 첫 오류가 발생했는지
2. 발생한 오류가 계산 실수, 개념 적용 오류, 부호 오류 등 어떤 유형의 오류인지 분석
3. 학생이 이해하기 쉽도록 명확하게 작성

간결하게 200자 이내로 작성해주세요.
"""

        try:
            client = AsyncOpenAI(api_key=self.openai_api_key)
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"AI 분석 생성 중 오류: {str(e)}")
            return f"총 {len(steps_info)}개의 단계 중 {len(incorrect_steps)}개의 단계에서 오류가 발견되었습니다. 첫 번째 오류는 {first_error}번째 단계에서 발생했습니다."
            
    async def _generate_weakness_analysis(
        self, 
        steps_info: List[Dict[str, Any]], 
        time_info: Dict[str, Any],
        incorrect_steps: List[int],
        low_confidence_steps: List[int]
    ) -> str:
        """약점 분석 생성: 시간 분석과 정성적 피드백"""
        system_prompt = """
당신은 중학생 수학 풀이 분석 전문가입니다.  
학생의 풀이 단계별 시간(step_times), 총 풀이 시간(total_solve_time),  
이해 시간(understand_time), 풀이 시간(solve_time), 검토 시간(review_time)을 기반으로  
학생의 풀이 습관의 강점과 개선점을 간결히 분석하세요.

단, 다음 기준을 지키세요:
- 문장 수는 최대 2문장, 총 200자 이내
- 수식 흐름과 시간 분포만 분석하세요.  
- 원인 추측, 학생의 성향이나 성격 유추는 하지 마세요.  
- 피드백은 긍정적 어조로 마무리해주세요.

시간 정보 용어 정의:
- step_times: 각 단계별 풀이 시간(초) - 현재 단계의 첫 작성부터 다음 단계 작성 시작까지
- total_solve_time: 문제풀이 페이지 렌더링부터 채점하기 버튼 클릭까지 총 소요 시간(초)
- understand_time: 문제 페이지 렌더링부터 풀이노트에 첫 작성 시작까지의 시간(초) - 문제 이해 시간
- solve_time: 풀이노트 첫 작성부터 마지막 작성까지의 시간(초) - 실제 풀이 시간
- review_time: 풀이노트 마지막 작성부터 답안 작성 시작까지의 시간(초) - 검토 시간
"""

        # 시간 정보 분석
        time_analysis = "시간 정보가 제공되지 않았습니다."
        longest_step_time = 0
        longest_step_idx = 0
        
        if time_info["step_times"]:
            # 가장 오래 걸린 단계 찾기
            for i, time in enumerate(time_info["step_times"]):
                if time and time > longest_step_time:
                    longest_step_time = time
                    longest_step_idx = i
                    
            time_analysis = f"가장 오래 걸린 단계는 {longest_step_idx + 1}번 단계로, {longest_step_time:.1f}초가 소요되었습니다."
            
            # 시간 분포 분석
            if time_info["understand_time"] is not None and time_info["solve_time"] is not None and time_info["review_time"] is not None:
                total = time_info["total_solve_time"] or (time_info["understand_time"] + time_info["solve_time"] + time_info["review_time"])
                
                understand_pct = time_info["understand_time"] / total * 100 if total > 0 else 0
                solve_pct = time_info["solve_time"] / total * 100 if total > 0 else 0
                review_pct = time_info["review_time"] / total * 100 if total > 0 else 0
                
                time_analysis += f" 전체 시간 중 문제 이해에 {understand_pct:.1f}%, 풀이 과정에 {solve_pct:.1f}%, 검토에 {review_pct:.1f}%를 사용했습니다."
                
                # 시간 패턴 분석
                if understand_pct < 10:
                    time_analysis += " 문제 이해 시간이 짧은 편입니다. 문제를 더 꼼꼼히 읽는 습관을 기르면 좋겠습니다."
                elif understand_pct > 40:
                    time_analysis += " 문제 이해에 많은 시간을 사용했습니다. 개념 이해를 강화하면 문제 해석 속도가 향상될 수 있습니다."
                    
                if review_pct < 5:
                    time_analysis += " 검토 시간이 매우 짧습니다. 풀이 후 검토는 오류 발견에 중요합니다."

        # 오류 분석
        error_analysis = ""
        if incorrect_steps:
            error_analysis = f"{len(incorrect_steps)}개의 단계에서 오류가 발생했습니다."
            
        # 글씨 및 정렬 분석 (confidence 기반)
        handwriting_analysis = ""
        if low_confidence_steps:
            handwriting_analysis = f"글씨를 알아볼 수 없는 단계({', '.join(map(str, low_confidence_steps))})가 있습니다. 글씨를 더 정확하게 쓰거나 수식 정렬을 개선하면 좋겠습니다."
            
        user_prompt = f"""
학생의 수학 풀이에 대한 약점 분석을 해주세요:

시간 분석:
{time_analysis}

글씨체:
{handwriting_analysis}

오류 분석:
{error_analysis}

다음 내용을 포함한 weakness 분석을 작성해주세요:
1. 가장 오래 걸린 단계와 시간 활용 패턴에 대한 피드백
2. OCR 인식률이 낮은 경우(confidence < 0.9) 글씨체나 정렬에 대한 조언
3. 오류 패턴이 있다면 이에 대한 분석

단, 다음 기준을 지키세요:
- 문장 수는 최대 2문장, 총 200자 이내
- 수식 흐름과 시간 분포만 분석하세요.  
- 원인 추측, 학생의 성향이나 성격 유추는 하지 마세요.  
- OCR 등의 시스템적 이슈에 대해서는 언급 하지마세요.
- 피드백은 긍정적 어조로 마무리해주세요.
"""

        try:
            client = AsyncOpenAI(api_key=self.openai_api_key)
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"약점 분석 생성 중 오류: {str(e)}")
            if low_confidence_steps:
                return "글씨를 더 정확하게 쓰고 정렬을 개선하면 좋겠습니다."
            elif incorrect_steps:
                return "풀이 과정에서 오류가 발견되었습니다. 피드백을 확인해주세요."
            else:
                return "풀이 흐름에 논리적인 문제가 없어 보입니다."