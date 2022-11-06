FROM node:16 AS builder

WORKDIR /app

COPY ./bin ./bin/
COPY ./index.html ./
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./public ./public/
COPY ./src ./src/
COPY ./tsconfig.json ./
COPY ./vite.config.ts ./

RUN npm install
RUN npm run build

FROM node:16 AS runtime

ARG UID
ARG GID

RUN groupadd -f -g $GID serviceusers
RUN useradd -o frontenduser -g $GID -u $UID

WORKDIR /app

COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/bin/ ./bin/
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/public/ ./public/

RUN npm install --omit=dev

USER frontenduser

ENTRYPOINT [ "node", "./bin/serve.js" ]
