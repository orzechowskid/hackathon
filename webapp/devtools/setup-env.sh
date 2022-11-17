function ensure () {
    key=$1
    val=$2

    if [ "" == "${!key}" ]; then
        export ${key}=$val
        echo "export ${key}=${val}"
    fi
}

function sourceEnvFile () {
    : "${ALEWIFE_ENV:=development}"
    ensure ALEWIFE_ENV $ALEWIFE_ENV

    for kvp in `cat $1 | grep -v '^#'`; do
        key=$(echo $kvp | cut -f 1 -d '=')
        val=$(echo $kvp | cut -f 2 -d '=')

        ensure $key $val
    done

    ensure NODE_LOCATION $NODE_NAME:$PROXY_SERVER_HTTPS
    ensure USER_ID `id -u`
    ensure GROUP_ID `id -g`
    ensure CONTAINER_HOST_ADDR "host.docker.internal"
}
