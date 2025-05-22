# External Services

## Google Auth
- **목적**: 구글 계정을 통한 소셜 로그인
- **사용 위치**: `backend/souffle/src/auth/strategies/google.strategy.ts` (NestJS Passport 적용)
- **주요 환경 변수**:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET_KEY`
  - `GOOGLE_CALLBACK_URL`
- **주의사항**: 
  - Google Cloud Console에서 Redirect URI 등록 필요
  - 로컬 개발 시 `http://localhost:4000/api/v1/auth/google/callback` 사용

---

## Mathpix API
- **목적**: 이미지 기반 수식 OCR 분석
- **사용 위치**: `data/app/services/ocr/mathpix_ocr.py`
- **공식 문서**: [https://mathpix.com/](https://mathpix.com/)
- **주요 환경 변수**:
  - `MATHPIX_APP_ID`
  - `MATHPIX_APP_KEY`
- **주의사항**: 
  - 하루 요청량 제한 있음
  - 요청 시 Base64 이미지와 함께 `application/json` 형식 전송 필요

---

## OpenAI API
- **목적**: 문제 풀이 해설 생성 및 분석 보조
- **사용 위치**: `data/app/services/analysis_service_v2.py`
- **공식 문서**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **주요 환경 변수**:
  - `OPENAI_API_KEY`
- **주의사항**:
  - 모델 사용량에 따라 비용 발생
  - 응답 지연 및 timeout 대비한 예외 처리 필요

---

## AWS

### EC2
- **목적**: 전체 서비스가 호스팅되는 인프라 서버
- **사용 위치**: 모든 Docker 서비스가 EC2 내에서 구동
- **주요 설정**:
  - IP / 도메인: `souffle.kr`
  - 포트 오픈: 80, 443 (Caddy), 5432 (PostgreSQL), 22 (SSH)
- **주의사항**: 
  - 보안 그룹에 따라 접근 제한 존재
  - 배포는 GitLab CI에서 SSH 연결을 통해 진행됨

### S3
- **목적**: 사용자 이미지, 오답 이미지 등 정적 자산 저장
- **사용 위치**: `backend/souffle/src/files/files.service.ts`
- **주요 환경 변수**:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET_NAME`
  - `AWS_REGION`
- **주의사항**: 
  - 버킷 퍼블릭 권한은 read only로 제한하고, Presigned URL 방식으로 접근
  - 이미지 업로드 시 MIME 타입 주의
