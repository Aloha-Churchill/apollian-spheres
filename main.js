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


function solveCircles(x1, y1, r1, x2, y2, r2, x3, y3, r3, r4) {
    // Calculate the coefficients of the equations
    const A1 = 2 * (x2 - x1);
    const B1 = 2 * (y2 - y1);
    const C1 = x2*x2 - x1*x1 + y2*y2 - y1*y1 + (r1 + r4)*(r1 + r4) - (r2 + r4)*(r2 + r4);
    
    const A2 = 2 * (x3 - x1);
    const B2 = 2 * (y3 - y1);
    const C2 = x3*x3 - x1*x1 + y3*y3 - y1*y1 + (r1 + r4)*(r1 + r4) - (r3 + r4)*(r3 + r4);
    
    // Use the elimination method to solve for a and b
    const det = A1*B2 - A2*B1;
    
    if (det === 0) {
        throw new Error("No unique solution exists.");
    }
    
    const a = (C1 * B2 - C2 * B1) / det;
    const b = (A1 * C2 - A2 * C1) / det;

    // return a point specificed where a is the x coord and b is the y coord
    return {x: a, y: b, z: 0};
}

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
    createCircle(radius1, points[0]);
    createCircle(radius2, points[1]);
    createCircle(radius3, points[2]);


    // Find two circles tangent to the first three using Descartes' Theorem
    let radius4 = 1/(1/radius1 + 1/radius2 + 1/radius3 + 2*Math.sqrt(1/radius1*1/radius2 + 1/radius2*1/radius3 + 1/radius3*1/radius1));
    let radius5 = 1/(1/radius1 + 1/radius2 + 1/radius3 - 2*Math.sqrt(1/radius1*1/radius2 + 1/radius2*1/radius3 + 1/radius3*1/radius1));

    console.log(radius4);
    let centroid4 = solveCircles(points[0].x, points[0].y, radius1, points[1].x, points[1].y, radius2, points[2].x, points[2].y, radius3, radius4); 
    createCircle(radius4, centroid4);

    console.log(radius5);
    let centroid5 = solveCircles(points[0].x, points[0].y, radius1, points[1].x, points[1].y, radius2, points[2].x, points[2].y, radius3, radius5);
    createCircle(radius5, centroid5);

}

generateBaseCircles();


function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

animate();