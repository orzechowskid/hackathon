#!/bin/bash

TARGET=$1

pushd `dirname $(realpath $0)` > /dev/null

function exitWith () {
    popd &> /dev/null
    exit $1
}

function warningText () {
    echo
    echo "It will always be cost-free to download and install this software, but"
    echo "depending on your choice of hosting provider it may not always be cost-"
    echo "free to run."
    echo "Your choice of hosting provider - and their rates, fees, and usage"
    echo "tiers - is very important.  While we do our best to ensure that Alewife"
    echo "can be run using as few resources as possible, we can not guarantee that"
    echo "you will incur no charges from your hosting provider in the course of"
    echo "running it."
    echo
    echo "Continue?"
    read -p "(y/N)> " ans
    echo

    if [ "$ans" != "y" ]; then
        echo "Exiting."
        echo
        exitWith 1
    fi
}

clear
echo "Welcome to Alewife!"
echo

if [ "$TARGET" == "" ]; then
    warningText
    echo
    echo "Which hosting provider are we configuring today?"
    echo "1  fly.io"
    echo "2  AWS"
    read -p "> " TARGET
    echo
fi

function flySetup () {
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

    pushd ./fly.io &> /dev/null

    ./build-docker-container.sh && \
        ./run-docker-container.sh

    popd &> /dev/null
}

case $TARGET in
    1|fly.io)
        echo "Building for fly.io"
        echo
        flySetup
        ;;
    2|AWS)
        echo "Building for AWS"
        echo "Not implemented yet"
        echo
        exitWith 1
        ;;
    *)
        echo "Invalid (or no) hosting provider specified; can't continue"
        echo
        exitWith 1
        ;;
esac

