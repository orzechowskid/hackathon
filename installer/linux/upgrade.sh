#!/bin/bash

TARGET=$1

pushd `dirname $(realpath $0)` > /dev/null

function exitWith () {
    popd &> /dev/null
    exit $1
}

function flyUpgrade () {
    echo "Do you have an active account with fly.io ?"
    read -p "(y/N)> " ans
    echo

    if [ "$ans" != "y" ]; then
        echo "fly.io setup requires an active fly.io account.  Please visit"
        echo "https://fly.io and sign up then re-run this setup script."
        echo
        exitWith 1
    fi

    echo "Do you have a fly.io personal access token to provide to this script?"
    read -p "(y/N)> " ans
    echo

    if [ "$ans" != "y" ]; then
        echo "fly.io setup requires an access token to be provided.  Please visit"
        echo "https://fly.io/user/personal_access_tokens to generate and download"
        echo "a token then re-run this setup script."
        echo
        exitWith 1
    fi

    echo "What is the URL of your fly.io site?"
    read -p "https://my-site-1234.fly.dev> " ans
    echo

    APP_NAME=`echo $ans | sed -e 's|https\?://||' | cut -f 1 -d '.'`

    pushd ./fly.io &> /dev/null

    ./build-docker-container.sh && \
        ./run-docker-container.sh upgrade $APP_NAME

    popd &> /dev/null
}

if [ "$TARGET" == "" ]; then
    echo
    echo "Which hosting provider are we upgrading today?"
    echo "1  fly.io"
    read -p "> " TARGET
    echo
fi

case $TARGET in
    1|fly.io)
        echo "Upgrading on fly.io"
        echo
        flyUpgrade
        ;;
    *)
        echo "Invalid (or no) hosting provider specified; can't continue"
        echo
        exitWith 1
        ;;
esac
