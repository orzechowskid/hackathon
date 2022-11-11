FROM node:16

WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./src ./src/

RUN npm install --omit-dev

ARG UID
ARG GID

RUN groupadd -f -g $GID serviceusers
RUN useradd -o frontenduser -g $GID -u $UID

ENTRYPOINT [ "node" "./src/index.js" ]
