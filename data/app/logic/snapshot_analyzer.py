# app/logic/snapshot_analyzer.py
"""
스냅샷 이미지 분석 모듈 - 단계별 전체 스냅샷에서 수식 변화를 감지하고 분석합니다.
"""

import re
import logging
import difflib
from typing import List, Dict, Tuple, Any, Optional

# 로깅 설정
logger = logging.getLogger(__name__)


class SnapshotAnalyzer:
    """
    단계별 전체 스냅샷 분석을 위한 클래스
    
    이 클래스는 타임라인별 스냅샷에서 수식을 추출하고,
    연속된 스냅샷 간의 변화를 감지하여 분석합니다.
    """
    
    @staticmethod
    def compare_latex_expressions(prev_latex: str, curr_latex: str) -> Dict[str, Any]:
        """
        연속된 두 LaTeX 문자열을 비교하여 변화된 부분을 감지
        
        Args:
            prev_latex (str): 이전 스냅샷의 LaTeX 문자열
            curr_latex (str): 현재 스냅샷의 LaTeX 문자열
            
        Returns:
            Dict: 변화 감지 결과 {'changed': bool, 'changes': list}
        """
        # 줄 단위로 분할
        prev_lines = prev_latex.strip().split('\n')
        curr_lines = curr_latex.strip().split('\n')
        
        # diff 계산
        differ = difflib.Differ()
        diff = list(differ.compare(prev_lines, curr_lines))
        
        # 변경된 라인 식별
        changes = []
        for i, line in enumerate(diff):
            if line.startswith('- '):
                # 이전 스냅샷에서 삭제된 라인
                prev_expr = line[2:]
                changes.append({'type': 'removed', 'prev': prev_expr, 'curr': None})
            elif line.startswith('+ '):
                # 현재 스냅샷에서 추가된 라인
                curr_expr = line[2:]
                changes.append({'type': 'added', 'prev': None, 'curr': curr_expr})
            elif line.startswith('? '):
                # 변경 지시자 (무시)
                continue
        
        # 변화된 라인들 조합 (삭제+추가 쌍 식별)
        combined_changes = []
        skip_indices = set()
        
        for i, change in enumerate(changes):
            if i in skip_indices:
                continue
                
            if change['type'] == 'removed':
                # 삭제 후 추가 패턴 찾기 (편집)
                for j, next_change in enumerate(changes[i+1:], i+1):
                    if j in skip_indices:
                        continue
                        
                    if next_change['type'] == 'added':
                        combined_changes.append({
                            'type': 'changed',
                            'prev': change['prev'],
                            'curr': next_change['curr']
                        })
                        skip_indices.add(j)
                        break
                else:
                    # 추가된 부분 없이 단순 삭제
                    combined_changes.append(change)
            elif change['type'] == 'added' and i not in skip_indices:
                # 이전 패턴에서 처리되지 않은 순수 추가
                combined_changes.append(change)
        
        return {
            'changed': len(combined_changes) > 0,
            'changes': combined_changes
        }
    
    @staticmethod
    def extract_equations_from_latex(latex: str) -> List[str]:
        """
        LaTeX 문자열에서 수식을 추출
        
        Args:
            latex (str): LaTeX 문자열
            
        Returns:
            List[str]: 추출된 수식 목록
        """
        # 빈 줄 제거 및 정규화
        lines = [line.strip() for line in latex.split('\n') if line.strip()]
        
        # 수식 추출 (다양한 패턴 고려)
        equations = []
        for line in lines:
            # 방정식 형태 확인
            if '=' in line:
                equations.append(line)
            # 표현식 형태 확인
            elif any(term in line for term in ['x', 'y', 'z', '+', '-', '*', '/']):
                equations.append(line)
        
        return equations
    
    @staticmethod
    def find_changed_equations(prev_latex: str, curr_latex: str) -> List[Dict[str, Any]]:
        """
        두 LaTeX 스냅샷 간에 변경된 수식을 감지
        
        Args:
            prev_latex (str): 이전 스냅샷의 LaTeX 문자열
            curr_latex (str): 현재 스냅샷의 LaTeX 문자열
            
        Returns:
            List[Dict]: 변경된 수식 정보 목록
        """
        # 각 스냅샷에서 수식 추출
        prev_eqs = SnapshotAnalyzer.extract_equations_from_latex(prev_latex)
        curr_eqs = SnapshotAnalyzer.extract_equations_from_latex(curr_latex)
        
        logger.debug(f"이전 스냅샷 수식: {prev_eqs}")
        logger.debug(f"현재 스냅샷 수식: {curr_eqs}")
        
        # 방법 1: 라인 수준의 변화 감지
        comparison = SnapshotAnalyzer.compare_latex_expressions(prev_latex, curr_latex)
        
        if not comparison['changed']:
            logger.debug("스냅샷 간 변화 없음")
            return []
        
        # 방법 2: 두 수식 집합 간 차이 감지
        removed = set(prev_eqs) - set(curr_eqs)
        added = set(curr_eqs) - set(prev_eqs)
        
        # 유사도에 기반한 변경 매핑
        equation_changes = []
        
        # 단순 추가/삭제 처리
        for eq in added:
            if not removed:
                # 순수 추가
                equation_changes.append({
                    'type': 'added',
                    'prev': None,
                    'curr': eq
                })
            else:
                # 삭제+추가 조합을 변경으로 간주하려면 유사도 계산
                best_match = None
                highest_ratio = 0
                
                for r_eq in removed:
                    ratio = difflib.SequenceMatcher(None, r_eq, eq).ratio()
                    if ratio > highest_ratio and ratio > 0.3:  # 30% 이상 유사하면 변경으로 판단
                        best_match = r_eq
                        highest_ratio = ratio
                
                if best_match:
                    equation_changes.append({
                        'type': 'changed',
                        'prev': best_match,
                        'curr': eq,
                        'similarity': highest_ratio
                    })
                    removed.remove(best_match)  # 매칭된 항목 제거
                else:
                    equation_changes.append({
                        'type': 'added',
                        'prev': None,
                        'curr': eq
                    })
        
        # 남은 삭제 항목 처리
        for eq in removed:
            equation_changes.append({
                'type': 'removed',
                'prev': eq,
                'curr': None
            })
        
        return equation_changes
    
    @staticmethod
    def filter_relevant_changes(changes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        분석에 중요한 변경사항만 필터링
        
        Args:
            changes (List[Dict]): 감지된 변경사항 목록
            
        Returns:
            List[Dict]: 필터링된 변경사항 목록
        """
        relevant = []
        
        for change in changes:
            # 변경 또는 추가된 항목만 고려
            if change['type'] in ['changed', 'added']:
                # 수학적 표현식 여부 확인
                curr = change.get('curr', '')
                if curr and any(ch in curr for ch in ['=', '+', '-', '*', '/', '^', 'x', 'y', 'z']):
                    relevant.append(change)
        
        return relevant
