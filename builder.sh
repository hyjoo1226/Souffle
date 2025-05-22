set -e

VITE_APP_API_URL=https://www.souffle.kr/api/v1 docker build --no-cache -t frontend:ci -f frontend/Dockerfile ./frontend

docker create --name tmp-frontend frontend:ci

rm -rf frontend/dist

mkdir -p frontend/dist

docker cp tmp-frontend:/app/dist/. ./frontend/dist/

docker rm tmp-frontend

docker compose up -d --build

docker restart caddy
