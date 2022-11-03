# Dockerfile.fly.io: Dockerfile for the fly.io deploy-process container
#
# docker build context needs to be repo root

FROM node:16-alpine

WORKDIR /app

RUN apk --no-cache add \
    bash \
    curl \
    jq
RUN curl -L https://fly.io/install.sh | sh

COPY frontend/dist/ ./frontend/dist/
COPY backend/src/ ./backend/src/
COPY backend/package.json ./backend/package.json
COPY backend/package-lock.json ./backend/package-lock.json
COPY Dockerfile.webapp ./Dockerfile
RUN cd backend && npm install

COPY installer/linux/fly.io/go.sh ./go.sh

ENTRYPOINT [ "./go.sh" ]
