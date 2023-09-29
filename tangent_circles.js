import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as math from 'mathjs';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 2, 5 );
controls.update();


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

    let radius1 = (distances[0] + distances[1] - distances[2])/2;
    let radius2 = (distances[0] + distances[2] - distances[1])/2;
    let radius3 = (distances[1] + distances[2] - distances[0])/2;

    // Draw three tangent circles with the three centroid points and corresponding radii
    // createCircle(radius1, points[0], stage);
    // createCircle(radius2, points[1], stage);
    // createCircle(radius3, points[2], stage);

    return {circle1: {x: points[0].x, y: points[0].y, radius: radius1}, circle2: {x: points[1].x, y: points[1].y, radius: radius2}, circle3: {x: points[2].x, y: points[2].y, radius: radius3}};

}

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

animate()