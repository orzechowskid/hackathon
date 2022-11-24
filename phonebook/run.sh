#!/bin/bash

: "${ALEWIFE_ENV:=development}"
source ../webapp/devtools/setup-env.sh

NODE_ENV=development \
    NODE_EXTRA_CA_CERTS=../webapp/devtools/fake-ca/root-ca/crt.pem \
    PORT=9000 \
    node ./bin/serve.js
