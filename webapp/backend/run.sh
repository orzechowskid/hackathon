#!/bin/bash

: "${ALEWIFE_ENV:=development}"
source ../devtools/setup-env.sh

sourceEnvFile ../.env.${ALEWIFE_ENV}

DB_CONNECTION_STRING=postgres://$PGUSER:$PGPASSWORD@localhost:$PGPORT/$PGDATABASE \
    JWT_SECRET=$BACKEND_JWT_SECRET \
    NODE_ENV=development \
    NODE_EXTRA_CA_CERTS=../devtools/fake-ca/root-ca/crt.pem \
    NODE_NAME=$NODE_LOCATION \
    PORT=$BACKEND_PORT \
    node ./bin/serve.js
