#!/bin/bash

function sourceEnvFile () {
    : "${ALEWIFE_ENV:=development}"
    export ALEWIFE_ENV=$ALEWIFE_ENV
    echo "export ALEWIFE_ENV=$ALEWIFE_ENV"

    for kvp in `cat $1 | grep -v '^#'`; do
        key=$(echo $kvp | cut -f 1 -d '=')
        val=$(echo $kvp | cut -f 2 -d '=')

        if [ "" == "${!key}" ]; then
            export ${key}=$val
            echo "export ${key}=${val}"
        fi
    done

    export NODE_LOCATION=$NODE_NAME:$PROXY_SERVER_HTTPS
    echo "export NODE_LOCATION=$NODE_LOCATION"
    export USER_ID=`id -u`
    echo "export USER_ID=$USER_ID"
    export GROUP_ID=`id -g`
    echo "export GROUP_ID=$GROUP_ID"
    export CONTAINER_HOST_ADDR=host.docker.internal
    echo "export CONTAINER_HOST_ADDR=$CONTAINER_HOST_ADDR"
}
