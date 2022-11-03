#!/bin/bash

TARGET=$1

function warningText () {
    clear
    echo "Welcome to Alewife!"
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

    if [ "$ans" != "y" ]; then
        echo "Exiting."
        echo
        exit 1
    fi
}

if [ "$TARGET" == "" ]; then
    warningText()
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
        exit 1
    fi

    echo "Do you have a fly.io personal access token to provide to this script?"
    read -p "(y/N)> "ans

    if [ "$ans" != "y" ]; then
        echo "fly.io setup requires an access token to be provided.  Please visit"
        echo "https://fly.io/user/personal_access_tokens to generate and download"
        echo "a token then re-run this setup script."
        echo
        exit 1
    fi
}

case $TARGET in
    1|fly.io)
        echo "Building for fly.io"
        flySetup()
        ;;
    2|AWS)
        echo "Building for AWS"
        echo "Not implemented yet"
        ;;
    *)
        echo "Invalid (or no) host provided; can't continue"
        echo
        exit 1
        ;;
esac

