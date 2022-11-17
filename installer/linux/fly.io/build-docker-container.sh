#!/bin/bash

pushd $(git rev-parse --show-toplevel) &> /dev/null

docker build -t alewife-installer-flyio -f installer/linux/fly.io/Dockerfile.flyio .

popd &> /dev/null
