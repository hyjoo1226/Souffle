# Building Manual
## Version
### FrontEnd
프레임워크: React (18+), TypeScript
번들러: Vite 5
### BackEnd
NestJS 11.0.6 (주요 API 서버)
FastAPI (AI 분석 서버)
### WebServer / Proxy
Caddy 2.7.4
### IDE
VSCode 1.100 (React), PyCharm 2025.1.1.1(FastAPI), IntelliJ 2025.1 (NestJS)

## environment variables
### FE
VITE_APP_API_URL=https://www.souffle.kr/api/v1
### BE
<details>
<summary>BE variables</summary>
<div markdown="1">

DB_HOST=db
DB_PORT=5432
DB_USERNAME=ssafy
DB_PASSWORD=ssafy1234
DB_DATABASE=app

NODE_ENV=production
PORT=4000

REDIS_HOST=redis
REDIS_PORT=6379

AWS_ACCESS_KEY_ID=my-aws-access-key-id
AWS_SECRET_ACCESS_KEY=my-aws-secret-access-key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=my-aws-s3-bucket-name

GOOGLE_CLIENT_ID=my-gogle-client-id
GOOGLE_CLIENT_SECRET_KEY=my-google-client-secret-key
GOOGLE_CALLBACK_URL=https://www.souffle.kr/api/v1/auth/google/callback

JWT_SECRET=my-jwt-secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

</div>
</details>

### DATA
<details>
<summary>DATA variables</summary>
<div markdown="1">

OCR_BACKEND=mathpix

MATHPIX_APP_ID=my-mathpix-app-id
MATHPIX_APP_KEY=my-mathpix-app-key

OPENAI_API_KEY=my-openai-api-key

DB_HOST=db
DB_PORT=5432
DB_USERNAME=ssafy
DB_PASSWORD=ssafy1234
DB_DATABASE=app

NODE_ENV=production
PORT=4000

REDIS_HOST=redis
REDIS_PORT=6379

</div>
</details>

## Deploy
- 프론트엔드 빌드는 Vite를 통해 `dist/`에 정적 파일로 출력되며, Caddy가 이를 서빙합니다.
- 백엔드는 NestJS와 FastAPI가 별도 컨테이너로 분리되어 배포되며, 내부 네트워크로 Redis, PostgreSQL과 연결됩니다.
- GitLab Runner가 CI/CD를 실행하며, `builder.sh`는 자동으로 docker-compose를 통해 모든 서비스를 초기화합니다.
- `.env` 파일이 없는 경우 컨테이너가 정상 실행되지 않으므로, 반드시 각 서비스별 환경 변수를 정의한 후 실행해야 합니다.
- Caddy는 HTTPS 인증서 자동 발급을 위해 외부 포트 80, 443이 열려 있어야 합니다.
- Redis는 stateless이므로 백업 대상이 아닙니다. PostgreSQL의 데이터는 volume에 지속 저장되며, 별도 백업 스크립트가 존재합니다.

## ERD properties
### ERD
docs/ERD.png
### Main tables
<details>
<summary>Tables</summary>
<div markdown="1">
- `user` : 서비스를 이용하는 회원
    - **id** : 기본키, 유저의 id로 중복을 허용하지 않는다. (`not null` / `int` )
    - **nickname** : 유저의 닉네임을 저장한다. (`not null` / `unique` / `varchar` )
    - **profile_image** : 유저의 프로필 이미지. ( `varchar` )
    - **created_at**: 생성 시간 (`datetime`)
    - **updated_at**: 갱신 시간 (`datetime`)

- `user_score_stat` : 유저 지표
    - **id** : 기본키, 유저의 id로 중복을 허용하지 않는다. (`not null` / `int` )
    - **user_id**: 외래키 (user의 id) (`not null` / `int` )
    - **correct_score**: 해결점수 (`float` )
    - **participation_score**: 참여점수 (`float` )
    - **speed_score**: 속도점수 (`float` )
    - **review_score**: 복습점수 (`float` )
    - **sincerity_score**: 성실점수 (`float` )
    - **reflection_score**: 복기점수 (`float` )
    - **created_at**: 생성 시간 (`datetime`)
    - **updated_at**: 갱신 시간 (`datetime`)

- `category` : 수학 단원별 정보 제공 테이블
    - **id** : 기본키,  중복을 허용하지 않는다. (`not null` / `int` / `auto_increment` )
    - **type** : 단원 분류 (`not null` / `int` )
        - 1(대단원), 2(중단원), 3(소단원)
    - **name**: 단원의 이름 (`not null` / `varchar` )
        - 대단원: 공통수학1, 미적분 등
        - 중단원: 지수와 로그, 등차수열과 등비수열 등
        - 소단원: 지수가 정수일 때의 지수법칙, 등비수열의 합 등
    - **parent_id**: 상위 단원의 id (`int` )
        - 소단원의 경우 중단원, 중단원의 경우 대단원
    - **avg_accuracy**: 해당 단원의 평균 정답률 (`float` )
        - 유저가 문제 풀 때마다 DB 갱신
    - **created_at**: 생성 시간 (`datetime`)
    - **updated_at**: 갱신 시간 (`datetime`)

- `problem` : 문제 정보 테이블
    - **id** : 기본키,  중복을 허용하지 않는다. (`not null` / `int` / `auto_increment` )
    - **category_id**: 외래키 (category의 id) (`not null` / `int` )
        - 소분류 id 우선 참조
        - 문제가 소분류가 아니라 중분류에 존재하는 경우(수능강에서 예제, 유제가 아닌 문제들) 중분류id 참조
    - **book_id**: 외래키 (book의 id) (`not null` / `int` )
    - **problem_no**: 문제 문항코드(`varchar`)
        - 수능특강의 경우 24008-0024 같은 형태(예제는 번호x)
    - **inner_no**: 문제 번호 (`not null` / `int`)
        - 각 단원 별 문제 번호이므로 중복 가능
        - 1번, 2번 …
    - **type**: 문제 유형 (`not null` / `int`)
        - 1(예제), 2(유제), 3(기초연습), 4(기본연습), 5(실력완성)
    - **content**: 문제 본문 (`not null` / `text`)
    - **choice**: 보기 (`json`)
        - 본문 아래 네모 박스 있는 경우, 혹은 객관식 문항도??
    - **problem_image_url**: 문제의 이미지가 존재하는 경우 (`varchar`)
    - **answer**: 문제의 답 (`varchar`)
    - **explanation**: 문제 해설 (`text`)
    - **explanation_image_url**: 해설의 이미지가 존재하는 경우 (`varchar`)
    - **avg_accuracy:** 평균 정답률 (`float` )
        - 문제 풀이마다 갱신
    - **avg_total_solve_time**: 평균 총 풀이 시간 (`int`)
        - 문제 풀이마다 갱신
    - **avg_understand_time**: 평균 문제 이해 시간 (`int`)
        - 문제 풀이마다 갱신
    - **avg_solve_time**: 평균 문제 풀이 시간 (`int`)
        - 문제 풀이마다 갱신
    - **avg_review_time**: 평균 검산 시간 (`int`)
        - 문제 풀이마다 갱신
    - **created_at**: 생성 시간 (`datetime`)
    - **updated_at**: 갱신 시간 (`datetime`)
</div>
</details>

### Schema
exec/schema.sql
### DB settings
- DB_HOST=db
- DB_PORT=5432
- DB_USERNAME=ssafy
- DB_PASSWORD=ssafy1234
- DB_DATABASE=app

## Presentation Scenario
1. 문제풀이 및 채점 시연
2. 기존 풀이 및 노트 불러오기
3. 개념 정리 기능 활용
4. 개념 예제 문제로 이동
5. 평가 리포트 확인 및 마무리
