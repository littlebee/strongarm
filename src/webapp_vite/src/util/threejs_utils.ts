import * as THREE from "three";

// @ts-expect-error "@types/three" does not have STLLoader
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { degToRad } from "three/src/math/MathUtils.js";

import { IArmPart } from "./hubState";

export interface Part3D {
    threeDObject: THREE.Object3D | null;
    part: IArmPart;
}

export async function loadStlFiles(parts: Part3D[] | null) {
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
