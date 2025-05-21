# app/services/result_saver.py
import os
import json
from datetime import datetime
from typing import List, Optional, Dict, Any


def save_analysis_result(
    problem_id: str,
    steps: List[dict],
    total_solve_time: Optional[int] = None,
    save_dir: str = "outputs/analysis_results",
    metadata: Optional[Dict[str, Any]] = None
) -> str:
    """
    분석 결과를 JSON 파일로 저장합니다.
    - problem_id: 문제 ID
    - steps: 각 단계별 latex, step_valid, feedback 포함된 리스트
    - total_solve_time: 전체 풀이 시간 (선택)
    - save_dir: 저장 디렉토리
    - metadata: 추가 메타데이터
    
    Returns:
        str: 저장된 파일 경로
    """
    os.makedirs(save_dir, exist_ok=True)
    timestamp = datetime.now().isoformat(timespec="seconds")

    result = {
        "problem_id": problem_id,
        "timestamp": timestamp,
        "total_solve_time": total_solve_time,
        "steps": steps
    }
    
    # 메타데이터 추가 (있는 경우)
    if metadata:
        result["metadata"] = metadata

    filename = f"{problem_id}_{timestamp.replace(':', '-')}.json"
    save_path = os.path.join(save_dir, filename)

    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"[ResultSaver] 분석 결과 저장 완료: {save_path}")
    return save_path


def load_latest_analysis(
    problem_id: str,
    save_dir: str = "outputs/analysis_results"
) -> Dict[str, Any]:
    """
    해당 문제 ID의 가장 최근 분석 결과를 로드합니다.
    
    Args:
        problem_id: 문제 ID
        save_dir: 분석 결과가 저장된 디렉토리
        
    Returns:
        Dict[str, Any]: 분석 결과 데이터
    """
    try:
        # 디렉토리 절대경로 생성
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        abs_save_dir = os.path.join(current_dir, save_dir)
        
        if not os.path.exists(abs_save_dir):
            print(f"[ResultLoader] 디렉토리가 존재하지 않음: {abs_save_dir}")
            return {}
            
        # 문제 ID와 관련된 파일 찾기
        files = [f for f in os.listdir(abs_save_dir) if f.startswith(f"{problem_id}_") and f.endswith(".json")]
        
        if not files:
            print(f"[ResultLoader] 문제 ID {problem_id}에 해당하는 분석 결과 파일이 없음")
            return {}
            
        # 최신 파일 찾기 (타임스태프 기준 정렬)
        latest_file = sorted(files, reverse=True)[0]
        file_path = os.path.join(abs_save_dir, latest_file)
        
        # JSON 파일 가져오기
        with open(file_path, "r", encoding="utf-8") as f:
            result = json.load(f)
            
        print(f"[ResultLoader] 분석 결과 가져오기 성공: {file_path}")
        return result
        
    except Exception as e:
        print(f"[ResultLoader] 분석 결과 불러오기 오류: {str(e)}")
        return {}