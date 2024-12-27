#/bin/sh

# this script is meant to be run from your local development machine.


if [ "$1" == "" ]; then
  echo "Error: missing parameter.  usage: sbin/upload.sh IP_ADDRESS_OR_NAME"
  exit 1
fi

TARGET_DIR="/home/$USER/strongarm"

if [ "$2" != "" ]; then
  TARGET_DIR=$2
fi

# echo on
set -x

TARGET_HOST=$1

rsync --progress --partial \
--exclude=node_modules \
--exclude=persisted_state.json \
--exclude=data/ \
--exclude=logs/ \
--exclude=*.pid \
--exclude=__pycache__ \
--exclude=.pytest_cache \
--exclude=.git \
-avz . $TARGET_HOST:$TARGET_DIR
