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


const initialCircle = createCircle(radius, { x: 0, y: 0, z: 0 });


function generateBaseCircles() {
    // Generate three random points in the window
    const points = [];
    for (let i = 0; i < 3; i++) {
        points.push({
            x: Math.random() * 2 * radius - radius,
            y: Math.random() * 2 * radius - radius,
            z: 0
        });
    }

    // Find the Euclidean distance between each pair of points and put this into an array
    const distances = [];
    for (let i = 0; i < 3; i++) {
        const point1 = points[i];
        for (let j = i + 1; j < 3; j++) {
            const point2 = points[j];
            const distance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
            distances.push(distance);
        }
    }

    

    // Draw three tangent circles with the three points
    for (let i = 0; i < 3; i++) {
        const point = points[i];
        createCircle(radius, point);
    }
}

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

animate();