# strongarm

The software and docs for my robotic arm.

The backend components are written in Python and the web UI served from the bot's Raspberry PI is in Javascript and React.

<img src="https://github.com/littlebee/strongarm/blob/014361c710a28d72579e17891dc30442e848df3a/docs/strongarm_webui.png"
     alt="design image"
     style="float: right; margin-right: 10px; width: 400px;" />


The [.stl files](https://github.com/littlebee/strongarm/tree/014361c710a28d72579e17891dc30442e848df3a/src/webapp/public) for the 3d parts I designed in Fusion 360 are actually used along with [three.js](https://threejs.org/) to render the arm in the web UI.  You can 3d print the parts from the .stl files.

You can also add different arm configurations, say if you want another 80mm segment or a different effector, you can easily add your own arm config JSON file to the [arm-configs folder](https://github.com/littlebee/strongarm/tree/main/src/webapp/public/arm-configs)

