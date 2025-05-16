# app/core/logging.py
import logging
import sys
import os
from datetime import datetime

def setup_logging(log_level=logging.INFO, log_to_file=True):
    """
    애플리케이션 로깅 설정
    
    Args:
        log_level (int): 로깅 레벨 (기본값: INFO)
        log_to_file (bool): 파일에 로깅 여부 (기본값: True)
    """
    # 로그 포맷 설정
    log_format = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 루트 로거 설정
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # 콘솔 핸들러 추가
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    root_logger.addHandler(console_handler)
    
    # 파일 핸들러 추가 (요청 시)
    if log_to_file:
        # 로그 디렉토리 생성
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)
        
        # 로그 파일명 (날짜 기반)
        today = datetime.now().strftime("%Y-%m-%d")
        log_file = os.path.join(log_dir, f"app_{today}.log")
        
        # 파일 핸들러 설정
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(log_format)
        root_logger.addHandler(file_handler)
    
    # 기본 라이브러리 로그 레벨 조정
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    
    # 시작 로그
    logging.info(f"로깅 설정 완료 (레벨: {logging.getLevelName(log_level)})")
