# app/services/embedding_service.py
from typing import List, Dict, Any, Optional, Tuple
from openai import AsyncOpenAI
from app.core.config import settings
import numpy as np
import logging
import json
import os
from pathlib import Path

# 로거 설정
logger = logging.getLogger(__name__)

class EmbeddingService:
    """
    수학 수식 임베딩 및 유사도 비교 서비스
    """
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
        self.embedding_model = getattr(settings, "EMBEDDING_MODEL", "text-embedding-3-small")
        self.embeddings_cache_dir = Path("static/embeddings")
        self.embeddings_cache = {}
        self._ensure_cache_dir()
        
    def _ensure_cache_dir(self):
        """캐시 디렉토리 생성"""
        os.makedirs(self.embeddings_cache_dir, exist_ok=True)
        
    def _get_cache_path(self, problem_id: str) -> Path:
        """임베딩 캐시 파일 경로"""
        return self.embeddings_cache_dir / f"{problem_id}_embeddings.json"
    
    def _load_cached_embeddings(self, problem_id: str) -> Optional[Dict[str, Any]]:
        """캐시된 임베딩 로드"""
        cache_path = self._get_cache_path(problem_id)
        if cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"임베딩 캐시 로드 오류: {str(e)}")
        return None
        
    def _save_embeddings_to_cache(self, problem_id: str, embeddings_data: Dict[str, Any]):
        """임베딩 캐시 저장"""
        cache_path = self._get_cache_path(problem_id)
        try:
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(embeddings_data, f, ensure_ascii=False, indent=2)
            logger.info(f"문제 {problem_id}의 임베딩 캐시 저장 완료")
        except Exception as e:
            logger.error(f"임베딩 캐시 저장 오류: {str(e)}")
            
    async def get_embedding(self, text: str) -> List[float]:
        """텍스트를 임베딩 벡터로 변환"""
        if not text or not text.strip():
            return []
        
        if not self.openai_api_key:
            # API 키가 없으면 mock 임베딩 반환
            return [0.1] * 10
            
        try:
            client = AsyncOpenAI(api_key=self.openai_api_key)
            response = await client.embeddings.create(
                model=self.embedding_model,
                input=text.strip()
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"임베딩 생성 오류: {str(e)}")
            # 오류 발생 시 기본 임베딩 반환
            return [0.0] * 10
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """두 임베딩 벡터 간의 코사인 유사도 계산"""
        if not embedding1 or not embedding2:
            return 0.0
            
        # 넘파이 배열로 변환
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # 벡터의 크기가 0인 경우 처리
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        # 코사인 유사도 계산
        return float(np.dot(vec1, vec2) / (norm1 * norm2))
    
    async def prepare_problem_embeddings(self, problem_id: str, problem_data: Dict[str, Any]) -> bool:
        """문제의 모범 답안을 임베딩하여 캐시에 저장"""
        # 이미 캐시에 있는지 확인
        if problem_id in self.embeddings_cache:
            return True
            
        # 캐시 파일 확인
        cached_data = self._load_cached_embeddings(problem_id)
        if cached_data:
            self.embeddings_cache[problem_id] = cached_data
            return True
            
        # 문제 데이터 확인
        if not problem_data:
            logger.warning(f"문제 {problem_id}의 데이터가 없어 임베딩을 생성할 수 없습니다.")
            return False
            
        # 풀이 단계 추출
        explanation = problem_data.get("explanation", "")
        if not explanation:
            logger.warning(f"문제 {problem_id}의 풀이 설명이 없어 임베딩을 생성할 수 없습니다.")
            return False
            
        # 풀이 단계 분리 (줄바꿈 기준)
        solution_steps = [step.strip() for step in explanation.split("\n") if step.strip()]
        
        # 각 단계 임베딩
        step_embeddings = []
        for step in solution_steps:
            embedding = await self.get_embedding(step)
            if embedding:
                step_embeddings.append({
                    "text": step,
                    "embedding": embedding
                })
                
        # 임베딩 데이터 구성
        embeddings_data = {
            "problem_id": problem_id,
            "solution_steps": solution_steps,
            "step_embeddings": step_embeddings
        }
        
        # 캐시에 저장
        self.embeddings_cache[problem_id] = embeddings_data
        self._save_embeddings_to_cache(problem_id, embeddings_data)
        
        logger.info(f"문제 {problem_id}의 임베딩 생성 완료 ({len(step_embeddings)} 단계)")
        return True
        
    async def analyze_solution_similarity(
        self, 
        problem_id: str, 
        problem_data: Dict[str, Any], 
        solution_steps: List[str]
    ) -> List[Dict[str, Any]]:
        """
        학생 풀이 단계와 모범 답안의 유사도 분석
        
        Returns:
            List[Dict[str, Any]]: 각 단계별 유사도 분석 결과
        """
        # 임베딩 준비
        await self.prepare_problem_embeddings(problem_id, problem_data)
        
        # 모범 답안 임베딩 가져오기
        problem_embeddings = self.embeddings_cache.get(problem_id)
        if not problem_embeddings or not problem_embeddings.get("step_embeddings"):
            logger.warning(f"문제 {problem_id}의 임베딩이 없습니다.")
            return [{"is_valid": True, "similarity": 0.0, "feedback": "모범 답안과 비교할 수 없습니다."} for _ in solution_steps]
            
        # 학생 풀이 각 단계 임베딩
        student_embeddings = []
        for step in solution_steps:
            embedding = await self.get_embedding(step)
            student_embeddings.append(embedding)
            
        # 각 단계별 유사도 분석
        results = []
        prev_similarity = 0.0
        
        for i, student_embedding in enumerate(student_embeddings):
            # 모든 모범 답안 단계와의 유사도 계산
            step_similarities = []
            for ref_step in problem_embeddings["step_embeddings"]:
                ref_embedding = ref_step["embedding"]
                similarity = self.calculate_similarity(student_embedding, ref_embedding)
                step_similarities.append((similarity, ref_step["text"]))
                
            # 가장 유사한 단계 찾기
            step_similarities.sort(reverse=True)
            best_similarity = step_similarities[0][0] if step_similarities else 0.0
            best_ref_step = step_similarities[0][1] if step_similarities else ""
            
            # 유사도 변화 계산
            similarity_change = best_similarity - prev_similarity
            
            # 유효성 판단 근본 로직 변경
            # 1. 절대적 유사도가 0.5 미만이면 무조건 유효하지 않음
            # 2. 유사도가 조금이라도 감소하면 유효하지 않음 (어떤 오차도 허용하지 않음)
            if i == 0:
                # 첫 단계는 유효하다고 간주
                is_valid = True
                validity_reason = "첫 단계는 항상 유효"
            elif best_similarity < 0.5:
                # 절대적 유사도가 0.5 미만이면 무조건 유효하지 않음
                is_valid = False
                validity_reason = f"절대적 유사도 0.5 미만 (={best_similarity:.4f})"
            else:
                # 유사도가 조금이라도 감소하면 유효하지 않음
                is_valid = (similarity_change >= 0.0) # 어떤 오차도 허용하지 않음
                if is_valid:
                    validity_reason = f"유사도 증가 또는 유지 ({similarity_change:.4f})"
                else:
                    validity_reason = f"유사도 감소 ({similarity_change:.4f})"
                
            # 유사도 상세 로그 추가
            similarity_status = "증가" if similarity_change > 0 else "감소" if similarity_change < 0 else "유지"
            
            logger.info(f"[유사도분석] 단계 {i+1}: 유사도={best_similarity:.4f}, 변화={similarity_change:.4f} ({similarity_status}), 유효성={is_valid}, 판단근거={validity_reason}")
            
            # 임계값 근처의 값은 더 상세히 로깅
            if not i == 0 and abs(similarity_change) < 0.05:
                status_text = "증가/유지" if similarity_change >= 0 else "감소"
                logger.warning(f"[미세변화] 단계 {i+1}: 유사도={best_similarity:.4f}, 변화={similarity_change:.4f}, 차이={status_text}, 유효성={is_valid}")
            
            # 유사도와 가장 유사한 참조 단계 간의 비교 로그
            logger.debug(f"[유사도비교] 단계 {i+1}:\n학생: {solution_steps[i]}\n참조: {best_ref_step}")
            
            # 피드백 생성
            feedback = self._generate_similarity_feedback(
                is_valid, 
                best_similarity, 
                similarity_change,
                solution_steps[i],
                best_ref_step
            )
            
            # 결과 추가
            results.append({
                "is_valid": is_valid,
                "similarity": best_similarity,
                "similarity_change": similarity_change,
                "feedback": feedback,
                "best_match_step": best_ref_step
            })
            
            # 현재 유사도를 이전 유사도로 저장
            prev_similarity = best_similarity
            
        # 결과 요약 로그
        valid_steps = sum(1 for r in results if r["is_valid"])
        invalid_steps = len(results) - valid_steps
        
        # 유사도 흐름 분석
        similarities = [r["similarity"] for r in results]
        changes = [r.get("similarity_change", 0) for r in results]
        
        logger.info(f"[분석결과] 총 {len(results)}개 단계 중 유효={valid_steps}, 유효하지 않음={invalid_steps}, 유효성 비율={valid_steps/len(results)*100:.1f}%")
        logger.info(f"[유사도흐름] 최대={max(similarities):.4f}, 최소={min(similarities):.4f}, 평균={sum(similarities)/len(similarities):.4f}, 판단기준: 0.5 미만 불합 & 감소 불합")
        
        # 처음으로 유효하지 않은 단계 표시
        if invalid_steps > 0:
            first_invalid_idx = next((i for i, r in enumerate(results) if not r["is_valid"]), -1)
            if first_invalid_idx >= 0:
                logger.warning(f"[잘못된단계] 처음 유효하지 않은 단계: {first_invalid_idx + 1}, 유사도={results[first_invalid_idx]['similarity']:.4f}, 변화={results[first_invalid_idx]['similarity_change']:.4f}")
        
        return results
        
    def _generate_similarity_feedback(
        self, 
        is_valid: bool, 
        similarity: float, 
        similarity_change: float,
        student_step: str,
        ref_step: str
    ) -> str:
        """유사도 기반 피드백 생성"""
        # 절대적 유사도가 매우 낮은 경우 (0.35 미만) - 전혀 다른 풀이 방법으로 판단
        if similarity < 0.35:
            return f"이 단계는 모범 답안과 매우 다른 풀이 방법을 사용하고 있습니다. 모범 답안에서는 '{ref_step}'와 같은 방식으로 풀이하고 있어요. 현재 풀이 방법을 다시 검토해 보세요."
        
        # 절대적 유사도가 낮은 경우 (0.35~0.45) - 부분적으로 의미가 일치하지만 해결 방식이 다름
        elif similarity < 0.45:
            # 유효성에 따른 피드백 제공
            if not is_valid:
                return f"이 단계는 모범 답안과 조금 다른 방식을 사용하고 있어요. 모범 답안에서는 '{ref_step}' 같은 풀이 방법을 사용합니다. 수식 변환을 다시 확인해 보세요."
            else:
                return "지금까지의 풀이 방식은 모범 답안과 조금 다르지만, 명확한 오류는 발견되지 않았습니다. 계속 풀어보세요."
        
        # 유효성 기반 피드백
        elif not is_valid:
            # 유사도 감소 경우
            if similarity < 0.5:
                return "이 단계는 모범 답안과 차이가 있습니다. 이전 단계를 확인하고 올바른 변환인지 다시 검토해 보세요."
            elif similarity < 0.6:
                return "이 단계는 모범 답안에서 벗어나고 있습니다. 이전 단계를 확인하고 올바른 변환인지 다시 검토해 보세요."
            else:
                return "올바른 방향으로 풀이 중이지만, 이전 단계에서 조금 벗어났습니다. 수식 변환을 다시 확인해 보세요."
        else:
            # 유효한 경우 (유사도 증가 또는 미미한 감소)
            if similarity > 0.7:
                return "아주 정확한 풀이 단계입니다! 모범 답안과 매우 유사한 접근 방식입니다."
            elif similarity > 0.6:
                return "올바른 접근 방식입니다. 계속해서 좋은 방향으로 진행하고 있습니다."
            elif similarity > 0.5:
                return "모범 답안과 유사한 방향으로 진행 중입니다. 수식 변환이 대체로 맞습니다."
            else:
                return "풀이 방식이 모범 답안과 다소 다르지만, 지금까지는 명확한 오류가 발견되지 않았습니다. 계속 진행해 보세요."
