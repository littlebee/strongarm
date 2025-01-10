import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
// @ts-expect-error "@types/three" does not have OrbitControls
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// @ts-expect-error "@types/three" does not have STLLoader
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { degToRad } from "three/src/math/MathUtils.js";

import { IArmPart } from "../util/hubState";

const scene = new THREE.Scene();
let camera: THREE.Camera | null = null;
const renderer = new THREE.WebGLRenderer({ antialias: true });

interface Arm3DProps {
    armParts: IArmPart[];
    currentAngles?: number[];
}

interface Part3D {
    threeDObject: THREE.Object3D | null;
    part: IArmPart;
}

const Arm3D: React.FC<Arm3DProps> = ({ armParts, currentAngles = [] }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const parts: Part3D[] | null = useMemo(() => {
        return !armParts
            ? null
            : armParts.map((part) => ({
                  threeDObject: null,
                  part,
              }));
    }, [armParts]);

    useEffect(() => {
        if (!parts || !currentAngles) return;

        const mount = mountRef.current;
        if (!mount) return;

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

        loadStlFiles().then(() => {
            let parent: THREE.Object3D = scene;
            for (const part of parts) {
                if (!part.threeDObject) continue;

                parent.add(part.threeDObject);
                part.threeDObject.position.set(
                    part.part.position.x - (part.part.rotationOffset?.x || 0),
                    part.part.position.y - (part.part.rotationOffset?.y || 0),
                    part.part.position.z - (part.part.rotationOffset?.z || 0)
                );
                parent = part.threeDObject;
            }
        });

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
                            part.part.maxAngle || part.part.motorRange || 270;
                        const midAngle = minAngle + (maxAngle - minAngle) / 2;
                        let newAngle =
                            midAngle - currentAngles[index] + initial;
                        if (part.part.invertRotation) {
                            newAngle *= -1;
                        }
                        part.threeDObject.rotation[axis] = degToRad(newAngle);
                    }
                }
            });
            if (camera) {
                renderer.render(scene, camera);
            }
        };

        animate();
    }, [parts, currentAngles]);

    async function loadStlFiles() {
        const loader = new STLLoader();
        const material = new THREE.MeshStandardMaterial({
            color: 0xff5533,
        });

        const promises: Array<Promise<void>> = [];
        parts?.forEach((part) => {
            const promise = new Promise<void>((resolve) => {
                loader.load(
                    "arm-parts/" + part.part.file,
                    (geometry: THREE.ShapeGeometry) => {
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
                    }
                );
            });
            promises.push(promise);
        });
        await Promise.all(promises);
    }

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Arm3D;
