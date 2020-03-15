FROM node:13

WORKDIR /app

COPY *.json ./
RUN npm ci --only=production

COPY src/ ./
RUN npm run build

CMD npm run server