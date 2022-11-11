#!/bin/bash

pushd `dirname $(realpath $0)` &> /dev/null

: "${ALEWIFE_ENV:=development}"

source ./setup-env.sh

sourceEnvFile ../.env.${ALEWIFE_ENV}

psql -U ${PGUSER} -d ${PGDATABASE} -h 127.0.0.1 -p ${PGPORT} < ../db/db.dump

popd &> /dev/null
