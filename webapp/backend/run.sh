#!/bin/bash

: "${ALEWIFE_ENV:=development}"
source ../devtools/setup-env.sh

sourceEnvFile ../.env.${ALEWIFE_ENV}

NODE_ENV=development \
    JWT_SECRET=$BACKEND_JWT_SECRET \
    PORT=$BACKEND_PORT \
    node ./src/index.js
