import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { degToRad } from "three/src/math/MathUtils.js";

const scene = new THREE.Scene();
let camera = null;
const renderer = new THREE.WebGLRenderer({ antialias: true });

const Arm3D = ({ armParts, currentAngles = [] }) => {
    const mountRef = useRef(null);
    const parts = useMemo(() => {
        return !armParts
            ? null
            : armParts.map((part) => ({
                  threeDObject: null,
                  part,
              }));
    }, [armParts]);

    console.log("Arm3D", { parts });

    useEffect(async () => {
        if (!parts || !currentAngles) return;

        const mount = mountRef.current;
        camera = new THREE.PerspectiveCamera(
            75,
            mount.clientWidth / mount.clientHeight,
            0.1,
            1000
        );

        // Scene setup
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
        parts.forEach((part, i) => {
            const promise = new Promise((resolve) => {
                loader.load(part.part.file, (geometry) => {
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.geometry.center();
                    const pivot = new THREE.Object3D();
                    // Add the mesh to the pivot
                    pivot.add(mesh);

                    // Position the mesh relative to the pivot
                    if (part.part.rotationOffset) {
                        mesh.position.setZ(part.part.rotationOffset);
                    }

                    // Rotate the pivot instead of the mesh
                    if (part.part.initialRotation) {
                        pivot.rotation[part.part.rotationAxis || "x"] =
                            degToRad(part.part.initialRotation);
                    }
                    part.threeDObject = pivot;
                    resolve();
                });
            });
            promises.push(promise);
        });
        await Promise.all(promises);

        let parent = scene;
        for (const part of parts) {
            parent.add(part.threeDObject);
            part.threeDObject.position.set(
                part.part.position.x,
                part.part.position.y,
                part.part.position.z - (part.part.rotationOffset || 0)
            );
            parent = part.threeDObject;
        }

        // Camera position
        camera.position.x = -600;
        camera.position.y = 280;
        camera.position.z = -60;

        camera.lookAt(-300, 260, 0);

        // const _controls = new OrbitControls(camera, renderer.domElement);

        // Cleanup on unmount
        return () => {
            mount.removeChild(renderer.domElement);
        };
    }, [parts]);

    useEffect(() => {
        if (!parts || !currentAngles) return;

        const movables = parts.filter((part) => !part.part.fixed);
        // console.log({ movables });

        const animate = () => {
            requestAnimationFrame(animate);

            movables.forEach((part, index) => {
                if (part && part.threeDObject) {
                    // console.log("Arm3D", { index, part });
                    part.threeDObject.rotation[part.part.rotationAxis || "x"] =
                        degToRad(90 - currentAngles[index]);
                }
            });
            // console.log("currentAngles", currentAngles);
            renderer.render(scene, camera);
        };

        animate();
    }, [parts, currentAngles]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Arm3D;