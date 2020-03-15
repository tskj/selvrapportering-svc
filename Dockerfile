FROM node:13

WORKDIR /app

COPY *.json ./
RUN npm ci --only=production

COPY src/ ./
RUN npm run build

ENV PORT=80
EXPOSE 80

CMD npm run server