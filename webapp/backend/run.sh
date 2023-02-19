#!/bin/bash

: "${ALEWIFE_ENV:=development}"
source ../devtools/setup-env.sh

sourceEnvFile ../.env.${ALEWIFE_ENV}

MEDIA_PATH=`realpath $BACKEND_MEDIA_PATH`
mkdir -p $MEDIA_PATH

DB_CONNECTION_STRING=postgres://$PGUSER:$PGPASSWORD@localhost:$PGPORT/$PGDATABASE \
    JWT_SECRET=$BACKEND_JWT_SECRET \
    MEDIA_PATH=$MEDIA_PATH \
    NODE_ENV=development \
    NODE_EXTRA_CA_CERTS=../devtools/fake-ca/root-ca/crt.pem \
    PORT=$BACKEND_PORT \
    PHONEBOOK_HOST=localhost:9000 \
    node ./bin/serve.js
