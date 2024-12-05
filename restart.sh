#!/bin/bash

# stop on fail
set -e

echo "Stopping services"
./stop.sh $@

echo "Sleeping for 5s"
sleep 5

echo "Starting services"
./start.sh $@
