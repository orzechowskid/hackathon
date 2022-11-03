#!/bin/bash

read -s -p "aws_access_key_id: " ACCESS_KEY
echo
read -s -p "aws_secret_access_key: " SECRET_KEY
echo
read -p "aws region (default us-east-1): " REGION

if [ "$REGION" == "" ]; then
    REGION=us-east-1
fi

docker run --rm -e AWS_ACCESS_KEY_ID=$ACCESS_KEY -e AWS_SECRET_ACCESS_KEY=$SECRET_KEY -e AWS_DEFAULT_REGION=$REGION alewife-installer-aws:latest
