#!/bin/bash

function sourceEnvFile () {
    : "${ALEWIFE_ENV:=development}"
    echo "export ALEWIFE_ENV=$ALEWIFE_ENV"

    for kvp in `cat $1 | grep -v '^#'`; do
        export $(echo $kvp | cut -f 1 -d '=')=$(echo $kvp | cut -f 2 -d '=')
        echo "export $(echo $kvp | cut -f 1 -d '=')=$(echo $kvp | cut -f 2 -d '=')"
    done

    export USER_ID=`id -u`
    echo "export USER_ID=$USER_ID"
    export GROUP_ID=`id -g`
    echo "export GROUP_ID=$GROUP_ID"
    export CONTAINER_HOST_ADDR=host.docker.internal
    echo "export CONTAINER_HOST_ADDR=$CONTAINER_HOST_ADDR"
}
