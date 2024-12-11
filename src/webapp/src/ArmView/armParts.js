export const armParts = [
    {
        name: "base",
        file: "turntable-bottom.stl",
        position: { x: 0, y: 0, z: 0 },

        // (optional) this part is fixed in place and should not be rotated
        fixed: true,

        // // (optional) this is the axis of rotation for the part
        // rotationAxis: "x",

        // // (optional) this is the center offset of the rotation axis in mm
        // rotationOffset: 0,

        // // (optional) this is the initial rotation of the part in degrees
        // initialRotation: 0,

        // // (result) this is the object that will be created by the loader
        // object: null,
    },
    {
        name: "turntable",
        file: "turntable-top.stl",
        // note that this position is relative to part above center to center
        // since the part is a child of the previous part
        position: { x: 0, y: -27, z: 50 },
    },
    {
        name: "arm-segment-1",
        file: "140mm-arm.stl",
        position: { x: 0, y: 0, z: 150 },
        rotationOffset: 120,
    },
    {
        name: "arm-segment-2",
        file: "80mm-arm.stl",
        position: { x: 0, y: 0, z: 360 },
        rotationOffset: 90,
    },
    {
        name: "arm-segment-3",
        file: "forearm.stl",
        position: { x: 0, y: 0, z: 270 },
        initialRotation: 90,
        rotationOffset: 50,
    },
];

export const movablePartNames = armParts
    .filter((part) => !part.fixed)
    .map((part) => part.name);
