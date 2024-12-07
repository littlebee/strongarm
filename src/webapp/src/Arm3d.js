import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

const Arm3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
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
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Base
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const baseGeometry = new THREE.CylinderGeometry(10, 10, 5, 32); // 10mm radius, 5mm height
    const base = new THREE.Mesh(baseGeometry, material);
    scene.add(base);

    // Load STL file
    const loader = new STLLoader();
    loader.load("/140mm arm.stl", (geometry) => {
      const armMaterial = new THREE.MeshStandardMaterial({ color: 0xff5533 });
      const armMesh = new THREE.Mesh(geometry, armMaterial);

      // Position the arm mesh
      armMesh.position.set(0, 20, 0); // 20mm above the base
      base.add(armMesh);
    });

    // Camera position
    camera.position.z = 200; // 200mm away from the origin
    camera.position.y = 200; // 200mm above the origin
    camera.position.x = 0;
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);

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
