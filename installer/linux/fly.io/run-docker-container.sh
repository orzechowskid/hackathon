#!/bin/bash

if [ "$FLY_ACCESS_TOKEN" == "" ]; then
    read -s -p "fly.io access token: " FLY_ACCESS_TOKEN
    echo
else
    echo "using existing FLY_ACCESS_TOKEN environment variable"
    echo
fi

if [ "$1" == "upgrade" ]; then
    docker run --rm -e FLY_ACCESS_TOKEN=$FLY_ACCESS_TOKEN alewife-installer-flyio:latest upgrade $2
else
    docker run --rm -e FLY_ACCESS_TOKEN=$FLY_ACCESS_TOKEN alewife-installer-flyio:latest
fi
