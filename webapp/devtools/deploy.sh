#!/bin/bash

pushd `dirname $(realpath $0)` > /dev/null

: "${ALEWIFE_ENV:=development}"
# TODO: add entry to /etc/hosts

echo ALEWIFE_ENV is $ALEWIFE_ENV

source ./setup-env.sh

# echo "stopping any running docker containers..."
# docker stop $(docker ps -aq) &> /dev/null

echo "setting environment variables..."
sourceEnvFile ../.env.$ALEWIFE_ENV

echo "ensuring database directory exists..."
mkdir -p ../db/storage/${ALEWIFE_ENV}

echo "creating SSL certificates..."
./fake-ca/create-certificates.sh

echo "building docker images..."
docker-compose build --no-cache
echo "starting docker containers..."
docker-compose up -d

popd &> /dev/null
