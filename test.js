import { SVGRenderer } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/SVGRenderer.js";

import * as THREE from 'three';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

/* Setup the renderer */
const renderer = new SVGRenderer(); // Init a renderer
renderer.overdraw = 0; // Allow three.js to render overlapping lines
renderer.setSize(window.innerWidth, window.innerHeight); // Define its size
document.body.appendChild(renderer.domElement); // Add the SVG in the DOM
renderer.domElement.setAttribute('xmlns' ,'http://www.w3.org/2000/svg'); // Add the xmlns attribute

/* Create 30 boxes */
const geometry = new THREE.BoxGeometry();
for (let i = 0; i < 20; i++) {
  // Create a random color for the material 
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff * Math.random()
  });
  // Create a box
  const box = new THREE.Mesh(geometry, material);
  // Randomize the position, scale & rotation
  box.position.random().subScalar(0.5).multiplyScalar(8);
  box.scale.random().multiplyScalar(2).addScalar(0.1);
  box.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

  // Add the box to the scene
  scene.add(box);
}

/* Render the scene */
renderer.render(scene, camera);