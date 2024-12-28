
## This is a work in progress. Will provide updates here and remove this banner when ready for others to use.

Earth date: Dec 26, 2024

The basic code will work to control the arm angles and select arm configs.  Working on Ros2 integration.

# strongarm

The software and docs for my robotic arm.

<img src="https://github.com/littlebee/strongarm/blob/014361c710a28d72579e17891dc30442e848df3a/docs/strongarm_webui.png"
     alt="web UI"
     style="float: right; margin-right: 10px; width: 400px;" />

## Table of Contents
  - [Physical build parts needed](#physical-build-parts-needed)
    - [3d print the files in `src/webapp/public/arm-parts`](#3d-print-the-files-in-srcwebapppublicarm-parts)
     - [Go shopping](#go-shopping)
  - [Onboard computer and micro controller](#onboard-computer-and-micro-controller)
  - [Getting started](#getting-started)
    - [buy / or build 👆 the arm](#buy--or-build--the-arm)
    - [Clone this repo](#clone-this-repo)
    - [SSH or bust](#ssh-or-bust)
    - [Upload software to on-board SBC](#upload-software-to-on-board-sbc)
    - [Run ./setup.sh on remote SBC](#run-setupsh-on-remote-sbc)
    - [Run the software on the remote](#run-the-software-on-the-remote)
    - [Debugging software problems](#debugging-software-problems)
      - [Are all of the services running on the on-board SBC?](#are-all-of-the-services-running-on-the-on-board-sbc)
      - [Use the webapp](#use-the-webapp)
      - [Inspecting the log files](#inspecting-the-log-files)
      - [Missing packages](#missing-packages)
  - [How it all works](#how-it-all-works)
    - [Central Hub](#central-hub)
  - [Gallery](#gallery)

## Physical build parts needed.

### 3d print the files in `src/webapp/public/arm-parts`
### Go shopping:
Note that I receive no compensation of any form from Amazon, it's just the one place where I know you can find all of these parts.  Please do shop around.  Temu and others have some of these parts for half as much.

| quantity | part needed | cost | link |
| -------- | ----------- | ---- | ---- |
| 1 | 35Kgcm 270&deg; servo for end effector| 28.96 | [amazon](https://www.amazon.com/gp/product/B07S9XZYN2/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1) |
| 1 | 20Kgcm 270&deg; servo for iphone rotator| 14.99 | [amazon](https://www.amazon.com/gp/product/B0B67YGV66/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&th=1) |
| 2 | 60Kgcm 270&deg; dual shaft servo for top arm segments| 30.00 | [amazon](https://www.amazon.com/gp/product/B0C1BXJWMK/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1) |
| 1 | 150Kgcm 270&deg; dual shaft servo for bottom arm joint| 44.00 | [amazon](https://www.amazon.com/gp/product/B0CP126F77/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1) |
| 1 | 60Kgcm 270&deg; single shaft servo for base turntable| 34.89 | [amazon](https://www.amazon.com/gp/product/B08HYX5SX3/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1) |
| 36 | M2 16m cap head bolts (for 3 arm join servos) | 6.28 | [amazon](https://www.amazon.com/iexcell-Thread-Socket-Screws-Finish/dp/B0D4JKNJXC/ref=sr_1_3) |
| 36 | M2 washers | 7.99 | [amazon](https://www.amazon.com/HELIFOUNER-Pieces-Washers-Diameter-Thickness/dp/B0B5GYG82X/ref=sr_1_3) |
| 24 | M3 12mm self tapping screws | 5.49 | [amazon](https://www.amazon.com/uxcell-Socket-Tapping-Screws-Carbon/dp/B0D9BDK6ZL/ref=sr_1_3) |
| 4 | M5 20mm button head screws for mounting turn table servo | 8.99 | [amazon](https://www.amazon.com/gp/product/B0BLNMLHYG/ref=ppx_yo_dt_b_search_asin_title) |
| 4 | M5 nuts | 6.99 | [amazon](https://www.amazon.com/Stainless-Self-Locking-Industrial-Construction-Fasteners/dp/B09PF4T3HD/ref=sr_1_3_pp) |
| 1 | 5x14x5mm bearing for iphone tilt arm effector. | 7.69 | [amazon](https://www.amazon.com/gp/product/B075CH4JD6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1) |
| 1 | 80x105x4mm thrust bearing for turntable base. | 8.78 | [amazon](https://www.amazon.com/gp/product/B07GC94P6Y/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1) |
| 3 - 4 ft | 3/4" Spiral wrap | 6.99 | [amazon](https://www.amazon.com/gp/product/B0CT8KFDLY/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1) |

You will also need to make or buy extension cables for the upper servos.  You can make your own if you have crimpimg tools and skill, wire, and a set of Dupont connectors something like [this set](https://www.amazon.com/gp/product/B07ZK5F8HP/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1). Or you can just buy [premade servo extension cables](https://www.amazon.com/TecUnite-Extension-Connectors-Connection-Control/dp/B07C18BXDV/ref=sr_1_4_sspa).

## Onboard computer and micro controller

I have tried be as platform agnostic as I can and the scripts and python code should work with any single board computer and servo controller supported by [Adafruit's servo-kit](https://docs.circuitpython.org/projects/servokit/en/stable/)

I know it works on a Raspberry Pi 4b (4GB), Raspian Bullseye 64, with the [Adeept Motor Hat](https://www.adeept.com/adeept-motor-hat-for-raspberry-pi-smart-robot-car-driver_p0133.html) because I had extra laying around.   The nice thing about the Adeept hat is that it has the power converter that can take any 12 - 60VDC power supply, supply the motors and also supply clean stable 5V power to the Raspberry Pi.

The fixed base model and sbc mounts were designed for the Pi 4/5 and may not fit larger sized SBCs, you will need to rectify that in Tinkercad on your own or house your SBC separately.


## Getting started

### buy / or build 👆 the arm.

For build help, here is the link to a web mockup shared from my fusion 360 disigns that shows the build with servos in place:  https://a360.co/3Phep9W

Connect the servos to the servo controller such that the base turntable servo is channel 0, and then up from there in sequential order.

### Clone this repo
```bash
git clone https://github.com/littlebee/strongarm.git
```

### SSH or bust

You will need to be able to SSH into the onboard computer to upload code to the SBC.  Ensure that you can successfully log-in,
```bash
ssh myrobotarm.local
```
replace "myrobotarm.local" with the hostname of your onboard computer or its IP address.

Setting up SSH on the SBC will be dependent on the SBC used and variatation of Linux.  For Raspian on Raspberry Pi, here is a [good article.](https://roboticsbackend.com/enable-ssh-on-raspberry-pi-raspbian/)  The raspian image flasher will now alow you to setup SSH from the initial boot full security.

I work on a macbook and use iTerm2 for terminal.  One of the additions I like to make to the standard setup, is to use the same user name on the Pi that I use locally on my mac.  This allows not having to type `ssh raspberry@mybot.local`, because the name is the same just `ssh mybot.local` works.

I also like to add my public key to the `~/.ssh/authorized_keys` file on the remote SBC. This will stop it from prompting you for the password on every SSH command (upload.sh uses rsync which uses ssh).   I made a [gist of the script](https://gist.github.com/littlebee/b285f0b9d219e56fe29b7248440309a5) I use to upload my public key to new boards.

### Upload software to on-board SBC

```bash
./upload.sh myarm.local
```
Upload script uses rsync to upload which only updates changes and is incrementally very fast.  You will use this script often and you intend to make changes to the code.

The upload script will default using your local $USER env.   If you want to use a different user ID on the remote, you will need to specify both the host with user@ prefix and the directory to upload to:
``` bash
./upload.sh pi@myarm.local /home/pi/strongarm
```
If you forget to add the directory when using `user@somehost.local`, you'll likely see a cryptic rsync error in the local terminal.


### Run ./setup.sh on remote SBC
```bash
# ssh onto the machine and cd to the strongarm dirctory.
ssh myarm.local
cd ~/strongarm
./setup.sh
```
You will need to confirm any packages that need to be installed.

Optional:  If you want the robot to start all of the services on boot, you can run these lines from the comments in `./setup.sh` script:
```bash
# rc.local calls start.sh
sudo cp setup/files/etc/rc.local /etc/
sudo chmod +x setup/files/etc/rc.local
```


### Run the software on the remote
```bash
# ssh onto the machine and cd to the strongarm dirctory.
ssh myarm.local
cd ~/strongarm
# run (on remote) startup script
./start.sh
```
That's pretty much it (if everything works, which it may not).  The start script reads the paths of python scripts that start the needed services (see, `services.cfg`).  Each Python script is launched in the background, the PID is saved (for ./stop.sh), and it's error and std output is saved to ~/strongarm/logs.

### Debugging software problems

#### Are all of the services running on the on-board SBC?
```bash
ps -ef | grep python3
```
Compare to `services.cfg` to ensure that all of the service python scripts are running.  Note that just because a service has a running process does not mean it is not failing somewhere.

#### Use the webapp

If the web_server.py and central_hub.py services are running, you might be able to get debug information from the web ui at http://myarm.local.  Click on the "HUB STATE" in the upper left corner and scroll down to `subsystemStatus`

#### Inspecting the log files

When started via `./start.sh`, each subsystem redirects its console ouput (stdout and stderr) to log files in `~/strongarm/logs`.


#### Missing packages

It is likely that the SBC operating system or Python installed onboard the bot may not have a either an OS package  or a Python package that is required.  These types of errors require [Inspecting the log files] to see the error that indicates which package(s) are missing at runtime.

If you find a missing package, please be a sport and add it to `setup.sh` and submit a PR, or just open an issue and let us know if something is missing.


## How it all works

<img src="https://github.com/littlebee/strongarm/blob/014361c710a28d72579e17891dc30442e848df3a/docs/strongarm_arch1_diagram.png"
     alt="web UI"
     style="float: right; margin-right: 10px; width: 600px;" />


The backend components are written in Python and the web UI served from the bot's Raspberry PI is in Javascript and React.

The [.stl files](https://github.com/littlebee/strongarm/tree/af9a326e82ebd4c26b2b3a7a883eda1c00eed1a0/src/webapp/public/arm-configs) for the 3d parts I designed in Fusion 360 are actually used along with [three.js](https://threejs.org/) to render the arm in the web UI.  You can 3d print the parts from the .stl files directly from the .stl files in src/webapp/putlic/arm-parts.  For my build pictured, I used Bambu Labs PLA-CF filament, at 0.2mm line height with 50% rectilinier infill.

You can also add different arm configurations, say if you want another 80mm segment or a different effector, you can easily add your own arm config JSON file to the [arm-configs folder](https://github.com/littlebee/strongarm/tree/main/src/webapp/public/arm-configs)

### Central Hub

Central Hub [src/central_hub.py](https://github.com/littlebee/strongarm/blob/main/src/central_hub.py) is an ultra light weight websockets pub/sub service for the other components that provide (publish) and comsume (subscribe) state.    The authorative state of the overall system (like what angles the servos are set) is owned and maintained by central_hub.

The other services use hub_state and hub_messages to send and receive messages from central hub over a websocket cient connection.   All data sent over the websocket to and from central_hub is in json and has the format:
```json
{
     "type": "string",
     "data": { ... }
}
```
Where `data` is optional and specific to the type of message. The following messages are supported by `central-hub`:

#### getState

example json:

```json
{
  "type": "getState"
}
```

Causes `central-hub` to send the full state via message type = "state" to the requesting client socket.

### identity

example json:

```json
{
  "type": "identity",
  "data": "My subsystem name"
}
```

Causes `central-hub` to update `subsystems_stats` key of the shared state and send an "iseeu" message back to client socket with the IP address that it sees the client.

### subscribeState

example json:

```json
{
  "type": "subscribeState",
  "data": ["system_stats", "set_angles"]
}
```

Causes `central-hub` to add the client socket to the subscribers for each of the state keys provided. Client will start receiving "stateUpdate" messages when those keys are changed. The client may also send `"data": "*"` which will subscribe it to all keys like the web UI does.

### updateState

example json:

```json
{
  "type": "updateState",
  "data": {
    "set_angles": [127.4, 66.4, 90, 90, 0],
    "velocity_factor": 1.5
  }
}
```

This message causes `central-hub` merge the receive state and the shared state and send `stateUpdate` messages to any subscribers. Note that the message sent **by clients** (type: "updateState") is a different type than the message **sent to clients** (type: "stateUpdate").

As the example above shows, it is possible to update multiple state keys at once, but most subsystems only ever update one top level key.

The data received must be the **full data for that key**. `central-hub` will replace that top level key with the data received.

### more

For the latest message types and information about the their data structure,  see `messageTypes` [supported in central_hub](https://github.com/littlebee/strongarm/blob/main/src/central_hub.py#L183)

Also look at https://github.com/littlebee/strongarm/blob/main/src/commons/hub_state.py which maintains this application's supported state,  what state keys are persisted, how state is merged from messages.  A few convienience methods for python clients can be found in [src/commons/messages.py](https://github.com/littlebee/strongarm/blob/main/src/commons/messages.py).

On the Javascript side, the webapp has similar components for [hub state](https://github.com/littlebee/strongarm/blob/main/src/webapp/src/util/hubState.js) and [hub messages](https://github.com/littlebee/strongarm/blob/main/src/webapp/src/util/hubMessages.js)



## Gallery

<img src="https://github.com/littlebee/strongarm/blob/e3338180583ad389d819a77262c7e733812e9a16/docs/IMG_0091.png"
     alt="actual build picture 1"
     style="float: right; margin-right: 10px; width: 400px;" />

<img src="https://github.com/littlebee/strongarm/blob/e3338180583ad389d819a77262c7e733812e9a16/docs/IMG_0092.png"
     alt="actual build picture 2"
     style="float: right; margin-right: 10px; width: 400px;" />

<img src="https://github.com/littlebee/strongarm/blob/e3338180583ad389d819a77262c7e733812e9a16/docs/IMG_0093.png"
     alt="actual build picture 3"
     style="float: right; margin-right: 10px; width: 400px;" />

<img src="https://github.com/littlebee/strongarm/blob/e3338180583ad389d819a77262c7e733812e9a16/docs/IMG_0094.png"
     alt="actual build picture 4"
     style="float: right; margin-right: 10px; width: 400px;" />


