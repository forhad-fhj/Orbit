FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm install

COPY . .

RUN npm run db:generate -w packages/prisma
RUN npm run build -w packages/shared-types
RUN npm run build -w apps/api

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "apps/api"]