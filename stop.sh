#!/bin/bash

# # stop on error - let other subs exit if any sub fails to exit
# set -e

# user=`echo $USER`
# if [ "$user" != "root" ]; then
#     echo "Script must be run as root.  Try 'sudo ./stop.sh'"
#     exit 1
# fi

to_stop=()
if [ $# -ne 0 ]; then
    to_stop=($@)
else
    # read all lines from ./services.cfg into to_start without
    # using readarray because it doesn't work on mac
    while read line; do
        #echo "read line: $line"
        # skip comments
        if [[ ${line:0:1} == "#" ]]; then
            continue
        fi
        to_stop+=("$line")
    done < ./services.cfg
fi

arraylength=${#to_stop[@]}
echo "stopping $arraylength services"

# stop in reverse order as start
for ((i=${#to_stop[@]}-1; i>=0; i--));
do
    sub_system=${to_stop[i]}
    echo "stopping $sub_system"

    base_name=$(basename $sub_system)
    logfile="./logs/$base_name.log"
    echo "stopping $sub_system at $(date)" >> "$logfile"

    pid_file="./$base_name.pid"

    if [ -f "$pid_file" ]; then
        kill -15 `cat $pid_file`
        # if kill worked, then remove the pid file
        if [ $? -eq 0 ]; then
            rm -f $pid_file
        else
            echo "kill failed for $sub_system.  Maybe retry using sudo ./stop.sh"
        fi
    else
        echo "$pid_file does not exist. skipping"
    fi
done