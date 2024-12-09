import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { degToRad } from "three/src/math/MathUtils.js";

const PARTS = [
    {
        name: "base",
        file: "turntable-bottom.stl",
        position: { x: 0, y: 28, z: 0 },
        fixed: true,
    },
    {
        name: "turntable",
        file: "turntable-top.stl",
        position: { x: 0, y: 0, z: 50 },
    },
    {
        name: "arm-segment-1",
        file: "140mm-arm.stl",
        position: { x: 0, y: 200, z: 0 },
        pivotPoint: { x: 0, y: 0, z: 0 },
        initialRotation: { x: degToRad(-90), y: 0, z: 0 },
    },
    {
        name: "arm-segment-2",
        file: "80mm-arm.stl",
        position: { x: 0, y: 440, z: 0 },
        initialRotation: { x: degToRad(-90), y: 0, z: 0 },
        // pivotPoint: { x: 0, y: -50, z: 550 },
    },
    {
        name: "arm-segment-3",
        file: "forearm.stl",
        position: { x: 0, y: 600, z: 0 },
        initialRotation: { x: degToRad(-45), y: 0, z: 0 },
        // pivotPoint: { x: 0, y: 0, z: 0 },
    },
];

const Arm3D = () => {
    const mountRef = useRef(null);

    useEffect(async () => {
        const mount = mountRef.current;

        // object meshs that can be rotated
        const movables = [];

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
        for (const part of PARTS) {
            const promise = new Promise((resolve) => {
                loader.load(part.file, (geometry) => {
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.geometry.center();

                    let objectToAdd = mesh;

                    if (part.fixed) {
                        scene.add(objectToAdd);
                    }

                    // set the pivot point of the object
                    if (part.pivotPoint) {
                        objectToAdd = new THREE.Object3D();
                        objectToAdd.add(mesh);
                        mesh.position.set(
                            part.pivotPoint.x,
                            part.pivotPoint.y,
                            part.pivotPoint.z
                        );
                    }
                    // Position the arm mesh
                    objectToAdd.position.set(
                        part.position.x,
                        part.position.y,
                        part.position.z
                    );

                    // Rotate the arm mesh
                    if (part.initialRotation) {
                        objectToAdd.rotation.set(
                            part.initialRotation.x,
                            part.initialRotation.y,
                            part.initialRotation.z
                        );
                    }
                    // Add to movables
                    if (!part.fixed) {
                        movables.push(objectToAdd);
                    }
                    resolve();
                });
            });
            promises.push(promise);
        }
        await Promise.all(promises);

        console.log("movables", movables);
        // make all movable parts parent on previous part
        // so that they move together
        scene.add(movables[0]);
        for (let i = 1; i < movables.length; i++) {
            movables[i].removeFromParent();
            movables[i - 1].attach(movables[i]);
        }
        movables[1].rotation.x += degToRad(45);

        // Camera position
        camera.position.x = -540;
        camera.position.y = 265;
        camera.position.z = -288;

        camera.lookAt(-200, 300, 0);

        const _controls = new OrbitControls(camera, renderer.domElement);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
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
