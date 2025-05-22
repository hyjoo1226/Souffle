# 멀티모달 AI와 함께하는 수학 풀이 분석 서비스 - SOUFFLE

## 프로젝트 특징
1. 수식 입력을 입력 시간과 영역에 따라 분리하여 수식 OCR의 정확성 향상
2. 순차적으로 정리된 수식을 분석하여 풀이 접근 방식을 파악
3. 취약 개념과 실수 요인들을 정리하여 사용자에게 제공

## 주요 기능
1. 문제 선택 및 풀이 기능(이미지를 텍스트로 변환)
2. 입력 로그를 바탕으로 풀이 분석하여 피드백 및 취약점 제시
3. 오답노트 기능
4. 개인별 학습 리포트 

## 프로젝트 산출물
### 1. 와이어프레임 및 목업(Figma)
[Figma](https://www.figma.com/design/GBfV0HixUuzLokHHzjOdH8/%EC%9E%90%EC%9C%A8%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8?node-id=0-1&t=PZQVrt0SEjF4bzPC-1)

### 2. 요구사항 명세
[요구사항 명세](https://patch-country-94e.notion.site/1dc539f595068033a4cfd3c3b61192b3)

### 3. 설계
[ERD](https://patch-country-94e.notion.site/ERD-1d5539f5950681b9b189c8b73de0a52d)
[API](https://patch-country-94e.notion.site/API-Doc-1d5539f5950681cf96afcabb17b04247?pvs=74)

## 기술 스택 및 개발환경
- FE: React, Typescript
- BE: NestJS 11.0.6, FastAPI
- DB: PostgreSQL 17.4, Redis
- Infra: Docker, Caddy
- AI : pytorch, huggingface

## 팀원 및 역할

|윤상흠(팀장)|김승우|남기운|방성준|이승주|주현호|
|:---:|:---:|:---:|:---:|:---:|:---:|
|Data|Intra|Data|FrontEnd|FrontEnd|BackEnd|
