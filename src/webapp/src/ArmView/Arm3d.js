import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { degToRad } from "three/src/math/MathUtils.js";

import { armParts } from "./armParts";

const Arm3D = ({ currentAngles = [] }) => {
    const mountRef = useRef(null);
    const parts = useRef([...armParts]);

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
        parts.current.forEach((part, i) => {
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
        });
        await Promise.all(promises);

        const movables = [];
        let parent = scene;
        for (const part of parts.current) {
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
        camera.position.x = -600;
        camera.position.y = 280;
        camera.position.z = -60;

        camera.lookAt(-300, 260, 0);

        // const _controls = new OrbitControls(camera, renderer.domElement);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // TODO
            // movables.forEach((movable, index) => {
            //     movable.rotation.x = degToRad(90 - currentAngles[index]);
            // });

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
