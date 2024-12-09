import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { degToRad } from "three/src/math/MathUtils.js";

const parts = [
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
        // initialRotation: 0

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

const Arm3D = ({ currentAngles = [] }) => {
    const mountRef = useRef(null);

    useEffect(async () => {
        const mount = mountRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            mount.clientWidth / mount.clientHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x666666);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 20, 20);
        scene.add(directionalLight);

        const loader = new STLLoader();
        const material = new THREE.MeshStandardMaterial({ color: 0xff5533 });
        scene.rotateX((Math.PI / 2) * -1);

        // Load STL files
        const promises = [];
        for (const part of parts) {
            const promise = new Promise((resolve) => {
                loader.load(part.file, (geometry) => {
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.geometry.center();
                    const pivot = new THREE.Object3D();
                    // Add the mesh to the pivot
                    pivot.add(mesh);

                    // Position the mesh relative to the pivot
                    if (part.rotationOffset) {
                        mesh.position.setZ(part.rotationOffset);
                    }

                    // Rotate the pivot instead of the mesh
                    if (part.initialRotation) {
                        pivot.rotation[part.rotationAxis || "x"] = degToRad(
                            part.initialRotation
                        );
                    }
                    part.object = pivot;
                    resolve();
                });
            });
            promises.push(promise);
        }
        await Promise.all(promises);

        const movables = [];
        let parent = scene;
        for (const part of parts) {
            parent.add(part.object);
            part.object.position.set(
                part.position.x,
                part.position.y,
                part.position.z - (part.rotationOffset || 0)
            );
            if (!part.fixed) {
                movables.push(part.object);
            }
            parent = part.object;
        }

        // Camera position
        camera.position.x = -540;
        camera.position.y = 265;
        camera.position.z = -288;

        camera.lookAt(-200, 300, 0);

        const _controls = new OrbitControls(camera, renderer.domElement);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            // movables.forEach((movable, index) => {
            //     movable.rotation.x = degToRad(90 - currentAngles[index]);
            // });

            // TEMP
            parts[2].object.rotation.x = degToRad(45);

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup on unmount
        return () => {
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Arm3D;
