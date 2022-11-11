#!/bin/bash

pushd `dirname $(realpath $0)` > /dev/null

: "${ALEWIFE_ENV:=development}"
source ../devtools/setup-env.sh

sourceEnvFile ../.env.${ALEWIFE_ENV}

docker run -it --network=host -e PGHOST -e PGPORT -e PGUSER -e PGPASSWORD -e PGDATABASE jbergknoff/postgresql-client

popd &> /dev/null
