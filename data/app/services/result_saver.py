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
