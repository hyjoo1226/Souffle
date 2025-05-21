# app/scripts/test_equation_analysis.py
import asyncio
import os
import json
import sys
from datetime import datetime
from typing import List, Dict, Any, Optional

# 프로젝트 루트 경로를 Python 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.logic.equation_checker import analyze_step_change
from app.services.feedback_service import generate_feedback, generate_batch_feedback
from app.core.config import settings  # 환경 변수를 가져오기 위한 settings 임포트
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# .env 파일이 올바르게 로드되었는지 확인
def check_environment():
    """환경 변수 설정이 제대로 되었는지 확인"""
    for key in ['OPENAI_API_KEY', 'MATHPIX_APP_ID', 'MATHPIX_APP_KEY']:
        if not getattr(settings, key, None):
            logger.warning(f"{key} 환경 변수가 설정되지 않았습니다.")
        else:
            # API 키의 일부만 로그에 출력 (보안)
            value = getattr(settings, key)
            masked_value = value[:4] + "..." + value[-4:] if len(value) > 8 else "****"
            logger.info(f"{key} 환경 변수가 설정되어 있습니다: {masked_value}")

    # OpenAI API 키를 환경 변수로 설정 (다른 모듈이 사용할 수 있도록)
    if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
        os.environ['OPENAI_API_KEY'] = settings.OPENAI_API_KEY
        logger.info("OPENAI_API_KEY 환경 변수를 설정했습니다.")


async def analyze_equation_steps_text(
    latex_steps: List[str],
    grade: str = "grade_1",
    problem_id: str = "test_problem",
    save_results: bool = True,
    output_dir: str = "outputs/text_analysis"
) -> Dict[str, Any]:
    """
    텍스트 형태의 수식 단계를 분석하는 파이프라인
    
    Args:
        latex_steps: 각 단계의 LaTeX 수식 문자열 리스트
        grade: 학년 수준
        problem_id: 문제 ID
        save_results: 결과를 저장할지 여부
        output_dir: 저장 디렉토리
        
    Returns:
        Dict: 분석 결과
    """
    if len(latex_steps) < 1:
        raise ValueError("최소 1개 이상의 수식 단계가 필요합니다.")
    
    logger.info(f"수식 분석 시작 (총 {len(latex_steps)}단계)")
    start_time = datetime.now()
    
    # 환경 변수 확인
    check_environment()
    
    # 단계별 분석 결과
    analyzed_steps = []
    
    # 첫 번째 단계는 비교 대상이 없으므로 유효한 것으로 간주
    analyzed_steps.append({
        "step_index": 0,
        "latex": latex_steps[0],
        "is_valid": True,
        "confidence": 1.0
    })
    
    # 두 번째 단계부터 이전 단계와 비교하여 분석
    for i in range(1, len(latex_steps)):
        prev_expr = latex_steps[i-1]
        curr_expr = latex_steps[i]
        
        logger.info(f"[단계 {i}] 수식 검증 중...")
        logger.info(f"  이전: {prev_expr}")
        logger.info(f"  현재: {curr_expr}")
        
        try:
            # 수식 변환 검증
            analysis = analyze_step_change(prev_expr, curr_expr)
            is_valid = analysis["is_valid"]
            
            if not is_valid:
                logger.info(f"  결과: 유효하지 않음 ❌")
            else:
                logger.info(f"  결과: 유효함 ✅")
            
            # 분석 결과 저장
            step_data = {
                "step_index": i,
                "latex": curr_expr,
                "is_valid": is_valid,
                "confidence": 1.0,  # 텍스트 입력이므로 신뢰도는 1.0으로 설정
                "metadata": {
                    "prev_clean": analysis["prev_clean"],
                    "curr_clean": analysis["curr_clean"],
                    **(analysis.get("details", {}))
                },
                "grade": grade  # 학년 정보 추가
            }
            
            analyzed_steps.append(step_data)
            
        except Exception as e:
            logger.error(f"  오류: {str(e)}")
            # 예외 발생 시 유효하지 않은 것으로 처리
            step_data = {
                "step_index": i,
                "latex": curr_expr,
                "is_valid": False,
                "confidence": 0.0,
                "feedback": f"분석 중 오류 발생: {str(e)}",
                "grade": grade  # 학년 정보 추가
            }
            analyzed_steps.append(step_data)
    
    # 모든 단계에 대해 피드백 생성 (유효/무효 모두)
    logger.info(f"총 {len(analyzed_steps)-1}개 단계에 대해 피드백 생성 중...")
    
    for step_data in analyzed_steps[1:]:  # 첫 번째 단계는 건너뜀
        try:
            # 피드백 생성
            feedback = await generate_feedback(step_data)
            logger.info(f"[단계 {step_data['step_index']}] 피드백 생성 완료")
            logger.info(f"  {feedback.replace(chr(10), chr(10)+'  ')}")
            step_data["feedback"] = feedback
        except Exception as e:
            logger.error(f"피드백 생성 중 오류 발생: {str(e)}")
            # 오류 발생 시 간단한 메시지로 대체
            if step_data.get("is_valid", False):
                step_data["feedback"] = "올바른 풀이 단계입니다."
            else:
                step_data["feedback"] = f"피드백 생성 중 오류: {str(e)}"
    
    # 전체 분석 결과 구성
    error_steps = [step for step in analyzed_steps[1:] if not step.get("is_valid", False)]
    
    analysis_result = {
        "steps": analyzed_steps,
        "metadata": {
            "problem_id": problem_id,
            "grade": grade,
            "analysis_time": (datetime.now() - start_time).total_seconds(),
            "total_steps": len(latex_steps),
            "error_steps": len(error_steps),
            "analysis_type": "text"
        }
    }
    
    # 결과 저장
    if save_results:
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{problem_id}_{timestamp}.json"
        output_path = os.path.join(output_dir, filename)
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(analysis_result, f, ensure_ascii=False, indent=2)
        
        logger.info(f"분석 결과 저장 완료: {output_path}")
    
    logger.info("수식 분석 완료")
    
    return analysis_result


async def compare_analysis_results(
    result1_path: str,
    result2_path: str,
    output_dir: str = "outputs/comparisons"
) -> Dict[str, Any]:
    """
    두 분석 결과를 비교하여 차이점 분석
    
    Args:
        result1_path: 첫 번째 결과 파일 경로
        result2_path: 두 번째 결과 파일 경로
        output_dir: 비교 결과 저장 디렉토리
        
    Returns:
        Dict: 비교 결과
    """
    logger.info("분석 결과 비교 시작")
    
    # 결과 파일 로드
    with open(result1_path, "r", encoding="utf-8") as f:
        result1 = json.load(f)
    
    with open(result2_path, "r", encoding="utf-8") as f:
        result2 = json.load(f)
    
    # 메타데이터 추출
    meta1 = result1.get("metadata", {})
    meta2 = result2.get("metadata", {})
    
    # 비교 결과 구성
    comparison = {
        "comparison_time": datetime.now().isoformat(),
        "result1_info": {
            "problem_id": meta1.get("problem_id", "unknown"),
            "total_steps": meta1.get("total_steps", 0),
            "error_steps": meta1.get("error_steps", 0),
            "source": os.path.basename(result1_path)
        },
        "result2_info": {
            "problem_id": meta2.get("problem_id", "unknown"),
            "total_steps": meta2.get("total_steps", 0),
            "error_steps": meta2.get("error_steps", 0),
            "source": os.path.basename(result2_path)
        },
        "step_comparison": [],
        "summary": {
            "total_differences": 0,
            "validation_differences": 0,
            "feedback_differences": 0
        }
    }
    
    # 단계별 비교
    steps1 = result1.get("steps", [])
    steps2 = result2.get("steps", [])
    min_steps = min(len(steps1), len(steps2))
    
    for i in range(min_steps):
        step1 = steps1[i]
        step2 = steps2[i]
        
        step_diff = {
            "step_index": i,
            "latex1": step1.get("latex", ""),
            "latex2": step2.get("latex", ""),
            "differences": []
        }
        
        # 검증 결과 비교
        if step1.get("is_valid") != step2.get("is_valid"):
            step_diff["differences"].append({
                "type": "validation",
                "valid1": step1.get("is_valid"),
                "valid2": step2.get("is_valid")
            })
            comparison["summary"]["validation_differences"] += 1
        
        # 피드백 비교
        feedback1 = step1.get("feedback")
        feedback2 = step2.get("feedback")
        
        if bool(feedback1) != bool(feedback2):
            # 한쪽에만 피드백이 있는 경우
            step_diff["differences"].append({
                "type": "feedback_existence",
                "has_feedback1": bool(feedback1),
                "has_feedback2": bool(feedback2)
            })
            comparison["summary"]["feedback_differences"] += 1
        elif feedback1 and feedback2 and feedback1 != feedback2:
            # 둘 다 피드백이 있지만 다른 경우
            step_diff["differences"].append({
                "type": "feedback_content",
                "feedback1": feedback1,
                "feedback2": feedback2
            })
            comparison["summary"]["feedback_differences"] += 1
        
        # 차이가 있는 경우만 결과에 추가
        if step_diff["differences"]:
            comparison["step_comparison"].append(step_diff)
            comparison["summary"]["total_differences"] += len(step_diff["differences"])
    
    # 단계 수가 다른 경우
    if len(steps1) != len(steps2):
        comparison["summary"]["total_differences"] += 1
        comparison["structural_differences"] = [{
            "type": "step_count",
            "steps1": len(steps1),
            "steps2": len(steps2)
        }]
    
    # 결과 저장
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"comparison_{timestamp}.json"
    output_path = os.path.join(output_dir, filename)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(comparison, f, ensure_ascii=False, indent=2)
    
    logger.info(f"비교 결과 저장 완료: {output_path}")
    logger.info(f"총 차이점: {comparison['summary']['total_differences']}개")
    logger.info(f"  - 검증 결과 차이: {comparison['summary']['validation_differences']}개")
    logger.info(f"  - 피드백 차이: {comparison['summary']['feedback_differences']}개")
    
    logger.info("분석 결과 비교 완료")
    return comparison


# 예제 실행 함수
async def run_examples():
    """예제 수식으로 분석 실행"""
    logger.info("예제 분석 실행")
    
    # 환경 변수 확인
    check_environment()
    
    # 예제 1: 올바른 2차 방정식 풀이
    example1 = [
        "x^2 + 5x + 6 = 0",
        "(x + 2)(x + 3) = 0",
        "x + 2 = 0 \\lor x + 3 = 0",
        "x = -2 \\lor x = -3"
    ]
    
    # 예제 2: 오류가 있는 2차 방정식 풀이
    example2 = [
        "x^2 + 5x + 6 = 0",
        "(x + 2)(x + 3) = 0",
        "x + 2 = 0 \\lor x + 3 = 0",
        "x = 2 \\lor x = 3"  # 부호 오류
    ]
    
    # 예제 3: 오류가 있는 일차 방정식 풀이
    example3 = [
        "2x + 6 = 12",
        "2x = 12 + 6",  # 이항 오류
        "2x = 18",
        "x = 9"
    ]
    
    # 예제 실행
    logger.info("### 예제 1: 올바른 2차 방정식 풀이 ###")
    result1 = await analyze_equation_steps_text(
        latex_steps=example1,
        problem_id="quadratic_correct",
        grade="grade_3"  # 2차 방정식은 grade_3 템플릿 사용
    )
    
    logger.info("### 예제 2: 오류가 있는 2차 방정식 풀이 ###")
    result2 = await analyze_equation_steps_text(
        latex_steps=example2,
        problem_id="quadratic_error",
        grade="grade_3"  # 2차 방정식은 grade_3 템플릿 사용
    )
    
    logger.info("### 예제 3: 오류가 있는 일차 방정식 풀이 ###")
    result3 = await analyze_equation_steps_text(
        latex_steps=example3,
        problem_id="linear_error",
        grade="grade_1"  # 일차 방정식은 grade_1 템플릿 사용
    )
    
    # 결과 비교 (예시)
    import glob
    
    # 가장 최근 파일 찾기
    logger.info("### 결과 비교: 올바른 2차 방정식 vs 오류 2차 방정식 ###")
    correct_files = glob.glob("outputs/text_analysis/quadratic_correct_*.json")
    error_files = glob.glob("outputs/text_analysis/quadratic_error_*.json")
    
    if correct_files and error_files:
        correct_path = max(correct_files, key=os.path.getctime)
        error_path = max(error_files, key=os.path.getctime)
        
        await compare_analysis_results(
            correct_path,
            error_path
        )
    else:
        logger.warning("비교할 결과 파일을 찾을 수 없습니다.")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--examples":
        asyncio.run(run_examples())
    else:
        print("사용법: python test_equation_analysis.py --examples")
        print("또는 다른 스크립트에서 함수로 사용")
