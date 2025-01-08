#!/bin/bash

mkdir -p ./logs


HELP="
Usage: ./start.sh [service] [service] ...

Where: [service] = the main python file for the service to start in the
  form of a relative path from the root of the project to the src/*.py file.

If no services are specified, all services listed in services.cfg will be started.
Services will be started in the order they are listed in the file.

Example: ./start.sh src/central_hub.py src/strongarm.py
"

if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    echo "$HELP"
    exit 0
fi

# user=`echo $USER`
# if [ "$user" != "root" ]; then
#     echo "Script must be run as root.  Try 'sudo ./start.sh'"
#     exit 1
# fi

declare -a to_start=()

export LOG_ALL_MESSAGES=1

if [ $# -ne 0 ]; then
    to_start=($@)
    sleep=0
else
    # TODO :  # this is mostly needed for starting central hub which needs to start to
    #    the point of getting it's web socket server running before other services start
    sleep=2
    # read all lines from ./services.cfg into to_start without
    # using readarray because it doesn't work on mac
    while read line; do
        #echo "read line: $line"
        # skip comments
        if [[ ${line:0:1} == "#" ]]; then
            continue
        fi
        to_start+=("$line")
    done < ./services.cfg
fi

# echo "to_start: ${to_start[@]}"
# source .env
arraylength=${#to_start[@]}
echo "starting $arraylength services"

for (( i=0; i<${arraylength}; i++ ));
do
    sub_system=${to_start[i]}

    echo "starting $sub_system"

    base_name=$(basename $sub_system)
    logfile="./logs/$base_name.log"
    pid_file="./$base_name.pid"

    if [ "$STRONGARM_ENV" == "test" ]; then
        echo "running $sub_system in test mode"
        logfile="./logs/test_$base_name.log"
        pid_file="./test_$base_name.pid"
    fi

    if [ -f "$logfile" ]; then
        mv -f "$logfile" "$logfile".1
    fi

    if [ -f "./$pid_file" ]; then
        echo "cowardly refusing to overwrite existing pid file for $sub_system ($pid_file)"
        echo "please stop the service first"
        continue
    fi

    echo "starting $sub_system at $(date)" >> "$logfile"

    python3 $sub_system > $logfile 2>&1 &

    echo $! > ./$pid_file

    if [[ $sleep -gt 0 ]]; then
        echo "sleeping for $sleep seconds"
        sleep $sleep
    fi
done