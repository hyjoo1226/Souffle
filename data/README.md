# 분석 서버 (FastAPI 기반)

## 프로젝트 소개

OpenAI API를 활용하여 이미지에서 텍스트를 추출하고, 추출된 데이터를 DB에 저장하는 분석 서버입니다.  
현재 MVP 버전에서는 텍스트 변환 결과를 저장하고, 메인 서버에 성공/실패 여부만 반환하는 API를 제공합니다.

---

## 기술 스택

- Python 3.11
- FastAPI
- Uvicorn (ASGI 서버)
- OpenAI API
- dotenv (환경변수 관리)
- uv (로컬 가상환경 관리)

---

## 디렉토리 구조

data/
├── app/
│ ├── routers/ # API 라우터
│ ├── services/ # OpenAI 호출 등 비즈니스 로직
│ ├── models/ # 요청/응답 스키마
│ ├── database/ # DB 연결 (추후 추가 예정)
│ ├── core/ # 환경설정 및 유틸리티
│ └── main.py # FastAPI 진입점
├── ocr_models/ # OCR 모델 파일 저장소 (.bin, .so 등)
├── scripts/ # 초기화 스크립트 등
├── static/ # 고정 테스트 데이터
├── .env # 환경변수 파일
├── .gitignore
├── requirements.txt
└── README.md

---

## 실행 방법

1. 가상환경 생성 및 활성화

   ```bash
   uv venv
   source .venv/bin/activate  # 리눅스/맥
   .\.venv\Scripts\activate   # 윈도우
   ```

2. 패키지 설치

   ```bash
   uv pip install -r requirements.txt
   ```

3. 서버 실행
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 추가 예정 기능

- DB 연결 및 데이터 저장 기능
- 에러 로깅 및 처리 고도화
- 배포를 위한 Dockerfile 작성 및 배포 자동화
