#!/bin/bash

: "${ALEWIFE_ENV:=development}"
source ../webapp/devtools/setup-env.sh

sourceEnvFile .env.${ALEWIFE_ENV}

NODE_ENV=development \
    node ./src/index.js
