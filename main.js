import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 2, 5 );
controls.update();

// User parameters
const radius = 5;
const stage = 0; // Number of stages --> 3^(n+1) + 2 = number of spheres in stage n

// draw three circles where each pair shares a point of tagency of any size
function createCircle(radius, position, color=0xffffff) {
    const circle = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 64),
        new THREE.MeshBasicMaterial({ color: color, wireframe: true })
    );
    circle.position.set(position.x, position.y, position.z);
    scene.add(circle);
}

function getIntegralCurvatures(n) {
    return [-n, n + 1, n * (n + 1), n * (n + 1) + 1];
}


const initialCircle = createCircle(radius, { x: 0, y: 0, z: 0 });

// draw three circles where each pair shares a point of tagency of any size
function drawSequentialCurvatures(n, circle) {
    if (n <= 0) return;

    const curvatures = getCurvatures(n);
    const radii = curvatures.map(k => 1 / k);

    // Draw the three inner circles based on the bounding circle.
    // For simplicity, we're not calculating the exact positions here.
    // In a real implementation, you'd compute their positions based on tangency.

    const circle1 = createCircle(radii[1], { x: -radii[1], y: 0, z: 0 });
    const circle2 = createCircle(radii[2], { x: radii[2] / 2, y: radii[2] * Math.sqrt(3) / 2, z: 0 });
    const circle3 = createCircle(radii[3], { x: radii[2] / 2, y: -radii[2] * Math.sqrt(3) / 2, z: 0 });

    // Recursively draw nested gaskets
    drawSequentialCurvatures(n - 1, circle1);
    drawSequentialCurvatures(n - 1, circle2);
    drawSequentialCurvatures(n - 1, circle3);
}



drawSequentialCurvatures(2, initialCircle);


function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

animate();