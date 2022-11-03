#!/bin/bash

PATH=~/.fly/bin:$PATH

if [ "$FLY_ACCESS_TOKEN" == "" ]; then
    echo "no Fly.io access key provided"
    exit 1
fi

echo "Launching..."
echo
fly launch --generate-name --region lax --remote-only --auto-confirm --dockerfile ./Dockerfile

echo "Deploying..."
echo
fly deploy

echo "Getting app name..."
echo
APP_INFO=`fly apps list -j`
echo $APP_INFO
APP_NAME=`echo $APP_INFO | jq -r '.[] | select(.Status == "running") | .Name'`

echo "Setting node name..."
echo
NODE_NAME=`echo $APP_INFO | jq -r '.[] | select(.Status == "running") | .Hostname'`
fly secrets set -a $APP_NAME NODE_NAME=$NODE_NAME

echo "done!"
echo "your Alewife node can be found at https://$NODE_NAME .  Now register it at alewife.io!"
