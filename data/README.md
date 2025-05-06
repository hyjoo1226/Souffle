# 수플래 분석 서버 (FastAPI 기반)

## 📋 개요

수식 이미지 → 텍스트 변환 → 수식 검증 → AI 피드백 → 결과 저장을 수행하는 FastAPI 기반 분석 서버입니다. 중학생 수학 풀이 이미지를 분석하여 단계별 논리적 변형의 타당성을 검증하고, 오류가 있는 경우 AI 기반 맞춤형 피드백을 제공합니다.

## 🛠️ 기술 스택

- **FastAPI**: 고성능 비동기 API 서버
- **SymPy**: 수식 검증 및 수학적 변환 검사
- **Mathpix API**: 수식 이미지 OCR (향후 자체 모델로 대체 예정)
- **OpenAI API**: AI 기반 학생 친화적 피드백 생성
- **Pydantic**: 데이터 검증 및 모델링

## 🔄 전체 분석 플로우

1. **이미지 수신**: 프론트에서 수식 단위로 분리된 이미지 업로드
2. **이미지 → 텍스트 변환**: OCR 엔진을 통해 수식 이미지를 LaTeX로 변환
3. **논리 검증**: SymPy 기반 알고리즘으로 단계별 논리 변형 검사
4. **AI 피드백**: 논리적 오류가 감지된 단계에 대해 OpenAI API 호출하여 피드백 생성
5. **결과 저장**: 전체 분석 결과를 JSON 형태로 저장 및 반환

## 📂 프로젝트 구조

```
data/
├── .env                    # 환경 변수 설정
├── app/                    # 메인 애플리케이션
│   ├── core/               # 핵심 유틸리티
│   │   ├── cache.py        # 캐싱 메커니즘
│   │   ├── config.py       # 환경 설정
│   │   ├── exceptions.py   # 예외 처리
│   │   ├── logging.py      # 로깅 설정
│   │   └── prompt_loader.py # 프롬프트 템플릿 로더
│   ├── database/           # 데이터베이스 연결 (향후 구현)
│   ├── logic/
│   │   └── equation_checker.py # 수식 검증 로직
│   ├── models/             # 데이터 모델
│   │   ├── ocr_schema.py   # OCR 요청/응답 스키마
│   │   └── result_schema.py # 결과 스키마
│   ├── routers/            # API 라우터
│   │   └── ocr_router.py   # OCR 관련 엔드포인트
│   ├── services/           # 비즈니스 로직
│   │   ├── analysis/       # 분석 관련 서비스
│   │   ├── ocr/            # OCR 서비스
│   │   │   ├── base_ocr.py # OCR 기본 클래스
│   │   │   ├── mathpix_ocr.py # Mathpix 구현
│   │   │   └── trocr_ocr.py # TrOCR 구현 (샘플)
│   │   ├── analysis_service.py # 분석 서비스
│   │   ├── feedback_service.py # AI 피드백 서비스
│   │   └── result_saver.py # 결과 저장 서비스
│   └── main.py            # 애플리케이션 진입점
├── ocr_models/            # OCR 모델 파일 (향후 추가)
├── outputs/               # 분석 결과 저장
├── scripts/               # 유틸리티 스크립트
├── static/                # 정적 파일
│   └── prompts/           # 프롬프트 템플릿
└── requirements.txt       # 의존성 패키지
```

## 🚀 주요 기능

### 1. 모듈화된 OCR 시스템

여러 OCR 엔진을 플러그인 방식으로 쉽게 전환할 수 있는 모듈화된 설계를 채택했습니다.

```python
# OCR 엔진 팩토리 함수
def get_ocr_engine(engine_type=None):
    engine = engine_type or settings.OCR_BACKEND
    
    if engine == "mathpix":
        return MathpixOCR()
    elif engine == "trocr":
        return TrOCR()
    else:
        raise OCRError(f"지원되지 않는 OCR 엔진: {engine}")
```

- **지원 엔진**:
  - `mathpix`: Mathpix API를 사용한 OCR (현재 기본값)
  - `trocr`: Microsoft TrOCR 기반 자체 OCR (개발 중)

### 2. 최적화된 AI 피드백 생성

OpenAI API 호출을 최적화하여 토큰 소모량과 비용을 줄였습니다.

- **캐싱 메커니즘**: 동일한 수식 오류 패턴에 대한 중복 API 호출 방지
- **일괄 처리**: 여러 오류를 단일 API 호출로 처리하여 효율성 향상
- **프롬프트 최적화**: 학년별 맞춤형 프롬프트 템플릿 지원

```python
# 여러 오류에 대한 일괄 피드백 생성
async def generate_batch_feedback(step_errors: List[Tuple[int, str, str]], grade: str) -> Dict[int, str]:
    # 캐시 확인 후 미캐시된 항목만 API 호출
    cached_results = {}
    uncached_steps = []
    
    for step_num, prev, curr in step_errors:
        cache_key = generate_cache_key(prev, curr)
        cached = feedback_cache.get(cache_key)
        if cached:
            cached_results[step_num] = cached
        else:
            uncached_steps.append((step_num, prev, curr))
    
    # 남은 항목 일괄 처리
    # ...
```

### 3. 강화된 오류 처리

세분화된 예외 처리와 표준화된 오류 응답 체계를 구축했습니다.

- **커스텀 예외 클래스**: `OCRError`, `MathParsingError`, `StepValidationError` 등
- **통합 오류 처리**: 모든 예외를 일관된 형식의 HTTP 응답으로 변환
- **상세 로깅**: 문제 추적 및 디버깅을 위한 다단계 로깅 시스템

### 4. 향상된 응답 스키마

더 풍부한 정보를 제공하는 응답 스키마로 개선했습니다.

- **신뢰도 정보**: OCR 결과의 신뢰도 점수 제공
- **메타데이터**: 추가 분석 정보 포함
- **구조화된 피드백**: 단계별 오류 정보 및 AI 피드백 포함

## 📡 API 엔드포인트

### 1. OCR 변환 (`POST /data/api/v1/ocr/answer`)

단일 수식 이미지를 LaTeX로 변환합니다.

**요청:**
```json
{
  "answer_image_url": "https://example.com/image.png",
  "engine": "mathpix"  // 선택 사항
}
```

**응답:**
```json
{
  "answer_convert": "x^2 + 3x - 4 = 0",
  "confidence": 0.95,
  "engine_used": "mathpix"
}
```

### 2. 단계별 분석 (`POST /data/api/v1/ocr/analysis`)

여러 단계로 이루어진 수학 풀이를 분석합니다.

**요청:**
```json
{
  "problem_id": "math_problem_123",
  "answer_image_url": "https://example.com/answer.png",
  "steps": [
    {
      "step_number": 1, 
      "step_time": 15,
      "step_image_url": "https://example.com/step1.png"
    },
    {
      "step_number": 2,
      "step_time": 20,
      "step_image_url": "https://example.com/step2.png"
    }
  ],
  "total_solve_time": 100,
  "understand_time": 30,
  "solve_time": 60,
  "review_time": 10,
  "engine": "mathpix"  // 선택 사항
}
```

**응답:**
```json
{
  "steps": [
    {
      "step_number": 1,
      "step_valid": true,
      "latex": "x^2 + 3x - 4 = 0",
      "confidence": 0.95
    },
    {
      "step_number": 2,
      "step_valid": false,
      "latex": "x^2 + 3x = 4",
      "confidence": 0.92,
      "feedback": "이항을 하실 때 부호가 바뀌지 않았네요. 우변으로 이항할 때는 부호를 반대로 바꿔야 합니다."
    }
  ],
  "ai_analysis": "1개의 단계에서 오류가 발견되었습니다.",
  "weakness": "이항 개념 적용에 오류가 있을 수 있습니다.",
  "engine_used": "mathpix",
  "metadata": {
    "total_steps": 2,
    "error_count": 1,
    "problem_id": "math_problem_123"
  }
}
```

## 🔄 데이터 흐름

1. **클라이언트 요청 수신**
   - 단계별 수식 이미지 URL 수신
   - OCR 엔진 타입 확인 (지정되지 않은 경우 기본값 사용)

2. **이미지 처리**
   - 이미지 다운로드 및 임시 저장
   - 선택된 OCR 엔진으로 텍스트 변환

3. **논리 검증**
   - 단계별 수식 변환의 수학적 타당성 검사
   - SymPy 라이브러리로 수식 간 동치 여부 확인

4. **오류 분석 및 피드백**
   - 오류 발견 시 해당 단계 수집
   - OpenAI API를 통한 일괄 피드백 생성

5. **결과 저장 및 반환**
   - 분석 결과 JSON 형태로 저장
   - 구조화된 응답 클라이언트에 반환

## 💻 설치 및 실행

### 요구 사항

- Python 3.8+
- 필요한 API 키: Mathpix API, OpenAI API

### 설치 방법

1. 저장소 클론:
   ```bash
   git clone <repository-url>
   cd data
   ```

2. 가상환경 생성 및 활성화:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # 또는
   .venv\Scripts\activate  # Windows
   ```

3. 의존성 설치:
   ```bash
   pip install -r requirements.txt
   ```

4. 환경 변수 설정:
   `.env` 파일 생성 및 다음 항목 설정:
   ```
   MATHPIX_APP_ID=your_mathpix_app_id
   MATHPIX_APP_KEY=your_mathpix_app_key
   OPENAI_API_KEY=your_openai_api_key
   OCR_BACKEND=mathpix
   ```

### 실행 방법

```bash
uvicorn app.main:app --reload
```

서버는 기본적으로 http://localhost:8000 에서 실행됩니다.
API 문서는 http://localhost:8000/docs 에서 확인할 수 있습니다.

## 🔧 향후 개선 계획

1. **자체 OCR 모델 구현**
   - TrOCR 기반 수식 특화 모델 개발
   - 한글 수식 인식 성능 향상

2. **성능 벤치마킹 시스템**
   - OCR 엔진 간 성능 비교 도구 개발
   - 정확도, 속도, 비용 효율성 측정

3. **학습 데이터셋 구축**
   - 중학교 수학 수식 데이터셋 구축
   - 다양한 난이도와 유형의 수식 포함

4. **분산 처리 지원**
   - 대규모 동시 요청 처리를 위한 확장성 개선
   - 작업 큐 및 비동기 처리 최적화

## 📜 라이센스

프로젝트 라이센스 정보
