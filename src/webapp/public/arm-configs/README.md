
The files in this directory each contain a list of parts that comprise the arm. Each part is treated as a child of the part before it meaning that the rotation of a part effects the position of all the parts after it like a segmented arm would.

Each part is a dictionary with the following keys:

- name: (required) a name for display purposes
- file: (required) This is the name of the 3d file that
lives in `src/webapp/public/arm-parts`
- position: (required) This is the position of the part relative to the part below it, in mm
- fixed: (optional) default: false; this part does not move
- rotationAxis: (optional) default: "x";  this is the axis of rotation
- rotationOffset: (optional) default: {x: 0, y: 0, z: 0}; this is the center offset of the rotation axis in mm
- initialRotation: (optional) default: {x: 0, y: 0, z: 0}; this is the initial rotation in degrees
- invertRotation: (optional) default: false.  part rotates counterclockwise
- motorRange: (option) default: 180; this is the max angle supported by the motor
- minAngle: (optional) default: 0; this is the minimum angle that the part can be rotated
- maxAngle: (optional) default: motorRange; this is the maximum angle that the part can be rotated

