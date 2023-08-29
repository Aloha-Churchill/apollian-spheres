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

function radiusToColor(radius) {
    
    const maxRadius = 5; 
    const minRadius = 0;

    const ratio = (radius - minRadius) / (maxRadius - minRadius);
    
    const red = Math.floor(255 * ratio);
    const blue = Math.floor(255 * (1 - ratio));

    return new THREE.Color(`rgb(${red}, 0, ${blue})`);
}

function createCircle(radius, position) {
    const color = radiusToColor(radius);
    const circleGeometry = new THREE.CircleGeometry(radius, 32);

    const circleMaterial = new THREE.LineBasicMaterial({ color: color });

    const circle = new THREE.LineLoop(circleGeometry, circleMaterial);
    circle.position.set(position.x, position.y, position.z);
    scene.add(circle);
}


// based on three circles, output the centroid of a fourth circle tangent to the first three
function generateNewCircle(x1, y1, r1, x2, y2, r2, x3, y3, r3) {
    // Find the radius of the fourth circle
    const r4 = 1/(1/r1 + 1/r2 + 1/r3 + 2*Math.sqrt(1/r1*1/r2 + 1/r2*1/r3 + 1/r3*1/r1));

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
    let new_centroid = {x: a, y: b, z: 0};

    // draw the new circle
    createCircle(r4, new_centroid);

    // return the new circle
    return {x: a, y:b, radius: r4};
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

    return {circle1: {x: points[0].x, y: points[0].y, radius: radius1}, circle2: {x: points[1].x, y: points[1].y, radius: radius2}, circle3: {x: points[2].x, y: points[2].y, radius: radius3}};

}


function recursiveGeneration(base_circle1, base_circle2, base_circle3, stage) {
    // generate new circles based on the previous three, make sure all permutations of three circles are covered
    if (stage === 0) {
        return;
    }
    else {
        console.log(base_circle1, base_circle2, base_circle3)
        console.log("-----")
        console.log(base_circle1.x, base_circle1.y)
        let new_circle = generateNewCircle(base_circle1.x, base_circle1.y, base_circle1.radius, base_circle2.x, base_circle2.y, base_circle2.radius, base_circle3.x, base_circle3.y, base_circle3.radius);
        console.log(new_circle);
        recursiveGeneration(base_circle1, base_circle2, new_circle, stage - 1);
        recursiveGeneration(base_circle1, new_circle, base_circle3, stage - 1);
        recursiveGeneration(new_circle, base_circle2, base_circle3, stage - 1);
    }
}

let { circle1: base_circle1, circle2: base_circle2, circle3: base_circle3 } = generateBaseCircles();
recursiveGeneration(base_circle1, base_circle2, base_circle3, 3);

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

animate();