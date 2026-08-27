FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci
RUN npm install -g prisma@5.22.0

COPY . .

RUN npm run build:api

EXPOSE 10000

CMD ["npm", "run", "start", "-w", "apps/api"]
