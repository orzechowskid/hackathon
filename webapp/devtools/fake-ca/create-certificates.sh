#!/bin/bash

pushd `dirname $(realpath $0)` > /dev/null

: "${ALEWIFE_ENV:=development}"
source ../setup-env.sh

sourceEnvFile ../../.env.${ALEWIFE_ENV}

function createRootCA () {
    rm -rf root-ca
    mkdir root-ca
    pushd root-ca &> /dev/null
    openssl genrsa -out key.pem
    openssl req -config ../openssl.cnf -key key.pem -new -x509 -days 3650 -extensions v3_ca -out crt.pem
    echo 1001 > crt.srl

    echo
    echo "########"
    echo "# new Certifiticate Authority certificate created"
    echo "########"
    echo
    echo "A new SSL certificate has been generated for a local-dev CA."
    echo "Please import the SSL certificate located at:"
    echo "        ${PWD}/cert.pem"
    echo "wherever SSL or HTTP access to:"
    echo "        $NODE_NAME"
    echo "is needed (e.g. your browser's trusted-CA list for web access, or your"
    echo "operating system's SSL keychain for SSL access)."
    echo
    read -p "Hit enter to continue..."
    echo

    popd &> /dev/null
}

function createIntermediateCA () {
    rm -rf ca
    mkdir ca
    pushd ca &> /dev/null

    openssl genrsa -out key.pem
    openssl req -config ../openssl.cnf -new -subj "/CN=Alewife CA" -key key.pem -out csr.pem
    openssl x509 -req -days 720 -in csr.pem -CA ../root-ca/crt.pem -CAkey ../root-ca/key.pem -extensions v3_intermediate_ca -extfile ../openssl.cnf -out crt.pem
    echo 1001 > crt.srl

    popd &> /dev/null
}

function createCertificates () {
    rm -rf domains/$1
    mkdir -p domains/$1
    pushd domains/$1 &> /dev/null

    openssl genrsa -out privkey.pem
    openssl req -config ../../openssl.cnf -new -subj "/CN=${NODE_NAME}" -extensions req_ext -key privkey.pem -out csr.pem
    openssl x509 -req -days 720 -in csr.pem -CA ../../ca/crt.pem -CAkey ../../ca/key.pem -extensions req_ext -extfile ../../openssl.cnf -CAcreateserial -out crt.pem

    cat crt.pem ../../ca/crt.pem ../../root-ca/crt.pem > fullchain.pem

    popd &> /dev/null
}

if [ -d root-ca ]; then
    echo "using existing root CA..."

    if [ -d ca ]; then
        echo "using existing intermediate CA..."

        if [ -d domains/${NODE_NAME} ]; then
            echo "using existing certificates..."

        else
            createCertificates $NODE_NAME
        fi
    else
        createIntermediateCA
        createCertificates $NODE_NAME
    fi
else
    createRootCA
    createIntermediateCA
    createCertificates $NODE_NAME
fi

echo "Done"

popd &> /dev/null
