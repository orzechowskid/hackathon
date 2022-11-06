#!/bin/bash


: "${ALEWIFE_ENV:=development}"
# TODO: add entry to /etc/hosts

source ./setup-env.sh

echo "stopping any running docker containers..."
docker stop $(docker ps -aq) &> /dev/null

echo "setting environment variables..."
sourceEnvFile ../.env.$ALEWIFE_ENV

echo "building docker images..."
docker-compose build
echo "starting docker containers..."
docker-compose up -d
