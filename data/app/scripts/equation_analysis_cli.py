# app/scripts/equation_analysis_cli.py
import argparse
import asyncio
import json
import sys
import os
import glob
import logging
from typing import List

# 프로젝트 루트 경로를 Python 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.scripts.test_equation_analysis import analyze_equation_steps_text, compare_analysis_results
from app.core.config import settings  # 환경 변수를 가져오기 위한 settings 임포트

# 로깅 설정
logging.basicConfig(
    level=logging.INFO, 
    format='[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def parse_args():
    parser = argparse.ArgumentParser(description="텍스트 수식 분석 도구")
    subparsers = parser.add_subparsers(dest="command", help="수행할 명령")
    
    # 분석 명령
    analyze_parser = subparsers.add_parser("analyze", help="수식 단계 분석")
    analyze_parser.add_argument("--file", "-f", help="수식 단계가 포함된 파일 경로")
    analyze_parser.add_argument("--steps", "-s", nargs="+", help="직접 입력한 수식 단계")
    analyze_parser.add_argument("--problem-id", "-p", default="test_problem", help="문제 ID")
    analyze_parser.add_argument("--grade", "-g", default="grade_1", help="학년 수준")
    analyze_parser.add_argument("--output-dir", "-o", default="outputs/text_analysis", help="결과 저장 디렉토리")
    
    # 비교 명령
    compare_parser = subparsers.add_parser("compare", help="분석 결과 비교")
    compare_parser.add_argument("result1", help="첫 번째 결과 파일 경로 (glob 패턴 지원)")
    compare_parser.add_argument("result2", help="두 번째 결과 파일 경로 (glob 패턴 지원)")
    compare_parser.add_argument("--output-dir", "-o", default="outputs/comparisons", help="비교 결과 저장 디렉토리")
    
    # 대화형 모드
    interactive_parser = subparsers.add_parser("interactive", help="대화형 분석 모드")
    
    # 예제 실행
    example_parser = subparsers.add_parser("examples", help="예제 수식 분석 실행")
    
    return parser.parse_args()


async def read_steps_from_file(file_path: str) -> List[str]:
    """파일에서 수식 단계 읽기"""
    with open(file_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]


async def interactive_mode():
    """대화형 분석 모드"""
    print("대화형 수식 분석 모드")
    print("각 단계 수식을 한 줄씩 입력하고, 마지막에 빈 줄을 입력하세요.")
    
    steps = []
    step_num = 1
    
    while True:
        step = input(f"단계 {step_num}: ").strip()
        if not step:
            break
        steps.append(step)
        step_num += 1
    
    if not steps:
        print("오류: 최소 1개 이상의 수식 단계가 필요합니다.")
        return
    
    problem_id = input("문제 ID (기본값: interactive_test): ").strip() or "interactive_test"
    grade = input("학년 수준 (기본값: grade_1): ").strip() or "grade_1"
    
    # 환경 변수 확인
    logger.info(f"API Key: {settings.OPENAI_API_KEY[:5]}...{settings.OPENAI_API_KEY[-5:] if settings.OPENAI_API_KEY else 'None'}")
    
    await analyze_equation_steps_text(
        latex_steps=steps,
        problem_id=problem_id,
        grade=grade
    )


async def resolve_glob_pattern(pattern: str) -> str:
    """
    Glob 패턴을 사용하여 가장 최근 파일 찾기
    """
    matching_files = glob.glob(pattern)
    if not matching_files:
        raise ValueError(f"패턴과 일치하는 파일을 찾을 수 없습니다: {pattern}")
    
    # 가장 최근 파일 반환
    return max(matching_files, key=os.path.getctime)


async def main():
    args = parse_args()
    
    # 환경 변수 확인
    logger.info("환경 변수 설정 확인")
    for key in ['OPENAI_API_KEY', 'MATHPIX_APP_ID', 'MATHPIX_APP_KEY']:
        if hasattr(settings, key):
            value = getattr(settings, key, None)
            if value:
                masked = value[:5] + "..." + value[-5:] if len(value) > 10 else "***"
                logger.info(f"{key}: {masked}")
            else:
                logger.warning(f"{key} 설정 없음")
    
    if args.command == "analyze":
        steps = []
        
        if args.file:
            steps = await read_steps_from_file(args.file)
        elif args.steps:
            steps = args.steps
        else:
            print("오류: --file 또는 --steps 옵션을 지정해야 합니다.")
            return
        
        if not steps:
            print("오류: 최소 1개 이상의 수식 단계가 필요합니다.")
            return
        
        await analyze_equation_steps_text(
            latex_steps=steps,
            problem_id=args.problem_id,
            grade=args.grade,
            output_dir=args.output_dir
        )
    
    elif args.command == "compare":
        try:
            # Glob 패턴 처리
            result1_path = await resolve_glob_pattern(args.result1)
            result2_path = await resolve_glob_pattern(args.result2)
            
            await compare_analysis_results(
                result1_path=result1_path,
                result2_path=result2_path,
                output_dir=args.output_dir
            )
        except ValueError as e:
            print(f"오류: {str(e)}")
    
    elif args.command == "interactive":
        await interactive_mode()
    
    elif args.command == "examples":
        from app.scripts.test_equation_analysis import run_examples
        await run_examples()
    
    else:
        print("명령을 지정해주세요. 도움말은 --help로 확인하세요.")


if __name__ == "__main__":
    asyncio.run(main())
