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

    useEffect(async () => {
        if (!parts || !currentAngles) return;

        const mount = mountRef.current;
        camera = new THREE.PerspectiveCamera(
            75,
            mount.clientWidth / mount.clientHeight,
            0.1,
            5000
        );

        // Scene setup
        scene.clear();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.replaceChildren(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x666666);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
        directionalLight.position.set(0, 20, 20);
        scene.add(directionalLight);
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight2.position.set(0, -20, -20);
        scene.add(directionalLight2);

        await loadStlFiles();

        let parent = scene;
        for (const part of parts) {
            parent.add(part.threeDObject);
            part.threeDObject.position.set(
                part.part.position.x - (part.part.rotationOffset?.x || 0),
                part.part.position.y - (part.part.rotationOffset?.y || 0),
                part.part.position.z - (part.part.rotationOffset?.z || 0)
            );
            parent = part.threeDObject;
        }

        // Camera position
        camera.position.x = -700;
        camera.position.y = 300;
        camera.position.z = 200;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(-200, 260, 300);
        controls.update();

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
                    if (index < currentAngles.length) {
                        const axis = part.part.rotationAxis || "x";
                        const initial = part.part.initialRotation?.[axis] || 0;
                        const minAngle = part.part.minAngle || 0;
                        const maxAngle =
                            part.part.maxAngle || part.part.motor_range || 270;
                        const midAngle = minAngle + (maxAngle - minAngle) / 2;
                        let newAngle =
                            midAngle - currentAngles[index] + initial;
                        if (part.part.invertRotation) {
                            newAngle *= -1;
                        }
                        console.log("Arm3d::animate()", {
                            part,
                            newAngle,
                        });
                        part.threeDObject.rotation[axis] = degToRad(newAngle);
                    }
                }
            });
            renderer.render(scene, camera);
        };

        animate();
    }, [parts, currentAngles]);

    async function loadStlFiles() {
        const loader = new STLLoader();
        const material = new THREE.MeshStandardMaterial({
            color: 0xff5533,
        });

        const promises = [];
        parts.forEach((part, i) => {
            const promise = new Promise((resolve) => {
                loader.load("arm-parts/" + part.part.file, (geometry) => {
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.geometry.center();
                    const pivot = new THREE.Object3D();
                    // Add the mesh to the pivot
                    pivot.add(mesh);

                    // Position the mesh relative to the pivot
                    if (part.part.rotationOffset) {
                        mesh.position.setX(part.part.rotationOffset.x || 0);
                        mesh.position.setY(part.part.rotationOffset.y || 0);
                        mesh.position.setZ(part.part.rotationOffset.z || 0);
                    }

                    // Rotate the pivot instead of the mesh
                    if (part.part.initialRotation) {
                        pivot.rotation.x = degToRad(
                            part.part.initialRotation.x || 0
                        );
                        pivot.rotation.y = degToRad(
                            part.part.initialRotation.y || 0
                        );
                        pivot.rotation.z = degToRad(
                            part.part.initialRotation.z || 0
                        );
                    }
                    part.threeDObject = pivot;
                    resolve();
                });
            });
            promises.push(promise);
        });
        await Promise.all(promises);
    }

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Arm3D;
