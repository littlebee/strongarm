
The files in this directory each contain a list of parts that make up the arm. Each part is a dictionar with the following keys:

- name: (required) a name for display purposes
- file: (required) this is the name of the 3d file that
lives in webapp/public
- position: (required) this is the position of the part relative to the part above it, in mm
- fixed: (optional) default: false; this part does not move
- rotationAxis: (optional) default: "x";  this is the axis of rotation
- rotationOffset: (optional) default: {x: 0, y: 0, z: 0}; this is the center offset of the rotation axis in mm
- initialRotation: (optional) default: {x: 0, y: 0, z: 0}; this is the initial rotation in degrees
- invertRotation: (optional) default: false.  part rotates counter clockwise
- v: (optional) default: 0; this is the minimum angle that the part can be rotated
- maxAngle: (optional) default: 180; this is the maximum angle that the part can be rotated

