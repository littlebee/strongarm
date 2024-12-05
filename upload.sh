#/bin/sh

# this script is meant to be run from your local development machine.


if [ "$1" == "" ]; then
  echo "Error: missing parameter.  usage: sbin/upload.sh IP_ADDRESS_OR_NAME"
  exit 1
fi

set -x

TARGET_DIR="/home/bee/brokebot"
TARGET_HOST=$1

rsync --progress --partial \
--exclude=node_modules \
--exclude=data/ \
--exclude=.git \
-avz . $TARGET_HOST:$TARGET_DIR
