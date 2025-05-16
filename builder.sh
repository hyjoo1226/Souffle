set -e

docker compose build --no-cache frontend

docker create --name tmp-frontend s12p31a304-frontend

rm -rf frontend/dist

docker cp tmp-frontend:/app/dist ./frontend/dist

docker rm tmp-frontend

docker compose up -d --build
