# Dockerfile consumed by the fly.io cli to create a cloud app

FROM node:16

WORKDIR /app

COPY ./backend/package.json ./
COPY ./backend/package-lock.json ./
COPY ./backend/src/ ./backend/src/
COPY ./backend/bin/ ./backend/bin/
COPY ./frontend/dist/ ./frontend/dist/

RUN npm install --omit=dev

ENV NODE_NAME=${FLY_APP_NAME}
ENV PORT=8080

EXPOSE ${PORT}

ENTRYPOINT [ "node", "./backend/bin/serve.js" ]
