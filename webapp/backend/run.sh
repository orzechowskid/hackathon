#!/bin/bash

: "${ALEWIFE_ENV:=development}"
source ../devtools/setup-env.sh

sourceEnvFile ../.env.${ALEWIFE_ENV}

NODE_ENV=development \
    NODE_EXTRA_CA_CERTS=../devtools/fake-ca/root-ca/crt.pem \
    NODE_NAME=$NODE_LOCATION \
    JWT_SECRET=$BACKEND_JWT_SECRET \
    PORT=$BACKEND_PORT \
    node ./src/index.js
