#!/bin/bash

mkdir -p ./logs

# user=`echo $USER`
# if [ "$user" != "root" ]; then
#     echo "Script must be run as root.  Try 'sudo ./start.sh'"
#     exit 1
# fi

declare -a to_start=()

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

    if [ -f "$logfile" ]; then
        mv -f "$logfile" "$logfile".1
    fi

    echo "starting $sub_system at $(date)" >> "$logfile"

    python3 $sub_system > $logfile 2>&1 &

    echo $! > ./$base_name.pid

    if [[ $sleep -gt 0 ]]; then
        echo "sleeping for $sleep seconds"
        sleep $sleep
    fi
done