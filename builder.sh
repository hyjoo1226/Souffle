set -e

VITE_APP_API_URL=https://www.souffle.kr/api/v1 docker compose build --no-cache frontend

docker create --name tmp-frontend s12p31a304-frontend

rm -rf frontend/dist

docker cp tmp-frontend:/app/dist ./frontend/dist

docker rm tmp-frontend

docker compose up -d --build

docker restart caddy
