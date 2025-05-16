FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev && npm audit fix --force

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
