# app/core/cache.py
from typing import Dict, Any, Optional
import time
import logging

# 로거 설정
logger = logging.getLogger(__name__)

class SimpleCache:
    """
    단순한 인메모리 캐시 구현
    키-값 쌍을 저장하고 TTL(Time-To-Live)을 지원합니다.
    """
    
    def __init__(self, ttl: int = 3600):
        """
        캐시 초기화
        
        Args:
            ttl (int): 캐시 항목의 수명(초), 기본값 1시간
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl
    
    def get(self, key: str) -> Optional[Any]:
        """
        캐시에서 값을 가져옵니다.
        
        Args:
            key (str): 가져올 항목의 키
            
        Returns:
            Optional[Any]: 캐시된 값 또는 키가 없거나 만료된 경우 None
        """
        if key not in self._cache:
            return None
        
        item = self._cache[key]
        # TTL 확인
        if time.time() > item["expires_at"]:
            # 만료된 항목 삭제
            del self._cache[key]
            return None
        
        return item["value"]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        캐시에 값 설정
        
        Args:
            key (str): 설정할 항목의 키
            value (Any): 저장할 값
            ttl (Optional[int]): 이 항목에 대한 특정 TTL, 기본값 사용 시 None
        """
        expires_at = time.time() + (ttl if ttl is not None else self.ttl)
        self._cache[key] = {
            "value": value,
            "expires_at": expires_at
        }
    
    def delete(self, key: str) -> bool:
        """
        캐시에서 항목 삭제
        
        Args:
            key (str): 삭제할 항목의 키
            
        Returns:
            bool: 항목이 삭제되었는지 여부
        """
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """모든 캐시 항목 삭제"""
        self._cache.clear()
    
    def cleanup(self) -> int:
        """
        만료된 모든 항목 삭제
        
        Returns:
            int: 삭제된 항목 수
        """
        now = time.time()
        expired_keys = [
            key for key, item in self._cache.items() 
            if now > item["expires_at"]
        ]
        
        for key in expired_keys:
            del self._cache[key]
        
        return len(expired_keys)

    def stats(self) -> Dict[str, Any]:
        """
        캐시 통계 정보 반환
        
        Returns:
            Dict[str, Any]: 캐시 통계 정보
        """
        now = time.time()
        active_count = sum(1 for item in self._cache.values() if now <= item["expires_at"])
        expired_count = len(self._cache) - active_count
        
        return {
            "total_items": len(self._cache),
            "active_items": active_count,
            "expired_items": expired_count
        }


# 피드백 캐싱을 위한 인스턴스 생성 (24시간 TTL)
feedback_cache = SimpleCache(ttl=24 * 3600)
