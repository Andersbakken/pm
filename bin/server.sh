#!/bin/bash

SCRIPT_PATH="${BASH_SOURCE[0]}"
pushd . > /dev/null
cd `basename $SCRIPT_PATH/..`
PM_DIR=`pwd`
popd > /dev/null

do
    node ./app/server.js "$@" &
    while ! /bin/true;
