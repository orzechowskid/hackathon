#!/bin/bash

PATH=~/.fly/bin:$PATH
REGION=lax

if [ "$FLY_ACCESS_TOKEN" == "" ]; then
    echo "no fly.io access key provided"
    exit 1
fi

echo
echo "Getting latest version of installer..."
fly version update
echo "...done"
echo

if [ "$1" == "upgrade" ]; then
    echo "upgrading $2..."
    fly deploy \
        --region $REGION \
        --remote-only \
        --app $2

    exit 0
fi

echo
echo "Launching..."
fly launch \
    --copy-config \
    --generate-name \
    --region $REGION \
    --remote-only \
    --auto-confirm
    
echo
echo "Getting app name..."
APP_INFO=`fly apps list -j`
export APP_NAME=`echo $APP_INFO | jq -r '.[] | select(.Status == "pending") | .Name'`
echo "$APP_NAME"

echo
echo "Setting node name..."
NODE_NAME=`echo $APP_INFO | jq -r '.[] | select(.Status == "pending") | .Hostname'`
echo "$NODE_NAME"

# TODO: detect existing databases
# TODO: set USER_NAME

echo
echo "Creating databases (this may take a few minutes)..."
DB_NAME=`echo $NODE_NAME | cut -d '.' -f 1`-db
# this flyctl command does not honor the `-j` flag :(
DB_CONNECTION_STRING=`fly postgres create -r $REGION -n $DB_NAME --initial-cluster-size 1 --volume-size 1 --vm-size shared-cpu-1x -j | tr ' ' '\n' | grep -m 1 postgres://`
echo "done"

echo
echo "configuring storage..."
fly volumes create alewife_storage -s 2 -r $REGION -a $APP_NAME -j
echo "done"

which md5sum
echo `head -c 128 /dev/urandom | md5sum`

echo
echo "configuring environment..."
fly secrets set -a $APP_NAME NODE_NAME=$NODE_NAME
fly secrets set -a $APP_NAME DB_CONNECTION_STRING=$DB_CONNECTION_STRING
fly secrets set -a $APP_NAME JWT_SECRET=`head -c 128 /dev/urandom | md5sum | head -c 32`
echo "done"

echo
echo "Seeding database..."
echo "exit;" >> ./create.sql
fly pg connect -a $DB_NAME < ./create.sql

echo
echo "Deploying (this may take a few minutes)..."
fly deploy -a $APP_NAME
echo "done"

echo "all set!"
echo "your Alewife node can be found at https://$NODE_NAME ."
