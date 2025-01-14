import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
// @ts-expect-error "@types/three" does not have OrbitControls
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { degToRad } from "three/src/math/MathUtils.js";

import { IArmPart } from "../util/hubState";
import { loadStlFiles } from "../util/threejs_utils";

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
        if (!parts || !mountRef.current) return;

        const mount = mountRef.current;
        let isLoaded = false;
        loadStlFiles(parts).then(() => {
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

            // Camera position
            camera.position.x = -700;
            camera.position.y = 300;
            camera.position.z = 200;

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(-200, 260, 300);
            controls.update();
            isLoaded = true;
        });
        // Cleanup on unmount
        return () => {
            scene.clear();
            if (isLoaded) mount.removeChild(renderer.domElement);
        };
    }, [parts]);

    useEffect(() => {
        if (!parts || !currentAngles) return;

        const movables = parts.filter((part) => !part.part.fixed);
        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

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

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [parts, currentAngles]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Arm3D;
