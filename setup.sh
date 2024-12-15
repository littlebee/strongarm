#!/bin/bash

# builds on top of pi4-bullseye-os64-pytorch-opencv-userbee.16GB.iso.zip

# echo on
set -x


# servo control
sudo pip3 install \
    adafruit-circuitpython-servokit \
    flask \
    flask-cors \
    psutil \
    websockets==10.4 \
    websocket-client \
    watchfiles \


# rc.local calls start.sh
sudo cp setup/files/etc/rc.local /etc/
sudo chmod +x setup/files/etc/rc.local

# # install network manager to create wifi hotspot
# sudo apt purge -y openresolv dhcpcd5 ifupdown
# sudo apt install -y network-manager
# sudo nmcli con add con-name hotspot ifname wlan0 type wifi ssid "sb101a"
# sudo nmcli con modify hotspot wifi-sec.key-mgmt wpa-psk
# sudo nmcli con modify hotspot wifi-sec.psk '2broken4u'
# sudo nmcli con up hotspot


