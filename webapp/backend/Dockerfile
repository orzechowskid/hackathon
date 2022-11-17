FROM node:16

ARG UID
ARG GID

RUN groupadd -f -g $GID serviceusers
RUN useradd -o backenduser -g $GID -u $UID

WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./src/ ./src/
COPY ./bin/ ./bin/

RUN npm install --omit=dev

USER backenduser

ENTRYPOINT [ "node", "./bin/serve.js" ]
