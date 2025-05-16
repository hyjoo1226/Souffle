#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
JSON 형식의 문제 데이터를 RAG 시스템에서 활용할 수 있는 형태로 변환하는 스크립트
사용법: python convert_problems_to_db.py <입력파일.json> <출력파일.json>
"""

import json
import sys
import os
import logging
import re

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def extract_description(content):
    """
    문제 내용에서 핵심 설명만 추출
    """
    # LaTeX 태그 및 불필요한 텍스트 제거
    clean_content = re.sub(r'\\[^\s\\]+ ', '', content)
    clean_content = re.sub(r'\\\([^)]+\\\)', '', clean_content)
    
    # 첫 번째 문장 또는 질문 부분만 추출
    lines = clean_content.split('\n')
    first_line = lines[0] if lines else ""
    
    # 선택지 등 불필요한 부분 제거
    question_part = first_line.split('①')[0] if '①' in first_line else first_line
    
    # 앞뒤 공백 및 줄바꿈 제거
    cleaned = question_part.strip()
    
    return cleaned

def convert_problems(input_file, output_file):
    """
    문제 데이터를 변환하고 저장
    
    Args:
        input_file (str): 입력 JSON 파일 경로
        output_file (str): 출력 JSON 파일 경로
    """
    try:
        # 입력 파일 읽기
        logger.info(f"입력 파일 읽기: {input_file}")
        with open(input_file, 'r', encoding='utf-8') as f:
            problems = json.load(f)
        
        # 데이터 형식 확인
        if not isinstance(problems, list):
            logger.error("입력 데이터가 리스트 형식이 아닙니다.")
            return False
        
        logger.info(f"총 {len(problems)}개의 문제가 로드되었습니다.")
        
        # 변환된 문제를 저장할 사전
        problems_db = {}
        
        # 각 문제 변환
        for problem in problems:
            # problemNo를 키로 사용
            problem_no = problem.get('problemNo', '')
            if not problem_no:
                logger.warning("문제 번호가 없는 항목을 건너뜁니다.")
                continue
            
            # 핵심 설명 추출
            content = problem.get('content', '')
            description = extract_description(content)
            
            # 변환된 형식으로 저장
            problems_db[problem_no] = {
                **problem,  # 기존 모든 필드 유지
                'description': description  # 핵심 설명 추가
            }
        
        # 결과 저장
        logger.info(f"변환된 {len(problems_db)}개의 문제를 저장합니다: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(problems_db, f, ensure_ascii=False, indent=2)
        
        logger.info("변환 완료!")
        return True
        
    except Exception as e:
        logger.error(f"오류 발생: {str(e)}")
        return False

def main():
    """
    명령줄 인자를 처리하는 메인 함수
    """
    if len(sys.argv) != 3:
        print(f"사용법: python {os.path.basename(__file__)} <입력파일.json> <출력파일.json>")
        return
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        logger.error(f"입력 파일이 존재하지 않습니다: {input_file}")
        return
    
    success = convert_problems(input_file, output_file)
    
    if success:
        logger.info(f"문제 변환 성공: {output_file}")
    else:
        logger.error("문제 변환 실패")

if __name__ == "__main__":
    main()
