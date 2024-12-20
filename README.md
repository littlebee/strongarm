# strongarm

The software and docs for my robotic arm.

The backend components are written in Python and the web UI served from the bot's Raspberry PI is in Javascript and React.

The [.stl files](https://github.com/littlebee/strongarm/tree/014361c710a28d72579e17891dc30442e848df3a/src/webapp/public) for the 3d parts I designed in Fusion 360 are actually used along with [three.js](https://threejs.org/) to render the arm in the web UI.  You can 3d print the parts from the .stl files.  For my build pictured, I used Bambu Labs PLA-CF filament, at 0.2mm line height with 50% rectilinier infill.

You can also add different arm configurations, say if you want another 80mm segment or a different effector, you can easily add your own arm config JSON file to the [arm-configs folder](https://github.com/littlebee/strongarm/tree/main/src/webapp/public/arm-configs)

Coming soon! (ish)  [ROS2](https://docs.ros.org/en/foxy/index.html) integration.

<img src="https://github.com/littlebee/strongarm/blob/014361c710a28d72579e17891dc30442e848df3a/docs/strongarm_webui.png"
     alt="web UI"
     style="float: right; margin-right: 10px; width: 400px;" />

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


