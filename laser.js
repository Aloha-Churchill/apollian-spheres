import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGRenderer } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/SVGRenderer.js";


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
const stage = 3; // Number of stages --> 3^(n+1) + 2 = number of spheres in stage n
const MAX_STAGE = 3;
const dimension = "2D"; // 2D or 3D

function radiusToColor(radius) {
    
    const maxRadius = 5; 
    const minRadius = 0;

    const ratio = (radius - minRadius) / (maxRadius - minRadius);
    
    const red = Math.floor(255 * ratio);
    const blue = Math.floor(255 * (1 - ratio));

    return new THREE.Color(`rgb(${red}, 0, ${blue})`);
}

//gerneate a map from stage number to a unique and distinct color
// stage 0 = white, stage 1 = blue, stage 2 = red, stage 4 = green, stage 5 = purple
function stageToColor(stage) {
    // if stage is 0, return white
    if (stage === 0) {
        return new THREE.Color(`rgb(255, 255, 255)`);
    }
    // if stage is 1, return blue
    else if (stage === 1) {
        return new THREE.Color(`rgb(0, 0, 255)`);
    }
    // if stage is 2, return red
    else if (stage === 2) {
        return new THREE.Color(`rgb(255, 0, 0)`);
    }
    // if stage is 3, return green
    else if (stage === 3) {
        return new THREE.Color(`rgb(0, 255, 0)`);
    }
}

// // generate a color based on the current stage
// function stageToColor(stage) {
//     console.log("Stage is: " + stage);

//     const maxStage = MAX_STAGE;
//     const minStage = 0;

//     const ratio = (stage - minStage) / (maxStage - minStage);

//     const red = Math.floor(255 * ratio);
//     const blue = Math.floor(255 * (1 - ratio));

//     return new THREE.Color(`rgb(${red}, 0, ${blue})`);
// }


// // MESH CIRCLE
// function createCircle(radius, position) {
//     const color = radiusToColor(radius);
//     const circleGeometry = new THREE.CircleGeometry(radius, 32);

//     const circleMaterial = new THREE.LineBasicMaterial({ color: color });

//     const circle = new THREE.LineLoop(circleGeometry, circleMaterial);
//     circle.position.set(position.x, position.y, position.z);
//     scene.add(circle);
// }

function createCircle(radius, position, stage) {
    // const color = radiusToColor(radius);
    const color = stageToColor(stage);

    // Generate perimeter points of the circle
    const segments = 128;
    const vertices = [];
    for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        vertices.push(x, y, 0);  // Assuming circle is in X-Y plane
    }

    // Create BufferGeometry from perimeter points
    const bufferCircleGeometry = new THREE.BufferGeometry();
    bufferCircleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const circleMaterial = new THREE.LineBasicMaterial({ color: color });
    const circle = new THREE.LineLoop(bufferCircleGeometry, circleMaterial);
    
    
    circle.position.set(position.x, position.y, position.z);
    scene.add(circle);
}

// function createCircle(radius, position) {
//     const color = radiusToColor(radius);
//     const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
//     const sphereMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true});
//     const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
//     sphere.position.set(position.x, position.y, position.z);
//     scene.add(sphere);
// }



// based on three circles, output the centroid of a fourth circle tangent to the first three
function generateNewCircle1(x1, y1, r1, x2, y2, r2, x3, y3, r3, stage) {
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
    createCircle(r4, new_centroid, stage);

    // return the new circle
    return {x: a, y:b, radius: r4};
}

// based on three circles, output the centroid of a fourth circle tangent to the first three
function generateNewCircle2(x1, y1, r1, x2, y2, r2, x3, y3, r3, stage) {
    // Find the radius of the fourth circle
    const r4 = 1/(1/r1 + 1/r2 + 1/r3 - 2*Math.sqrt(1/r1*1/r2 + 1/r2*1/r3 + 1/r3*1/r1));

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
    createCircle(r4, new_centroid, stage);

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
    // createCircle(radius1, points[0], stage);
    // createCircle(radius2, points[1], stage);
    // createCircle(radius3, points[2], stage);

    return {circle1: {x: points[0].x, y: points[0].y, radius: radius1}, circle2: {x: points[1].x, y: points[1].y, radius: radius2}, circle3: {x: points[2].x, y: points[2].y, radius: radius3}};

}


function generateBaseSpheres() {
    // Generate vertices of an equilateral tetrahedron

    let radius = 5;
    c1 = (radius/2, 0, -(radius/2)/Math.sqrt(2));
    c2 = (-(radius/2), 0, -(radius/2)/Math.sqrt(2));
    c3 = (0, (radius/2), (radius/2)/Math.sqrt(2));
    c4 = (0, -(radius/2), (radius/2)/Math.sqrt(2));

    // return the four vertices as x,y,z coordinates
    return {sphere1: {x: c1[0], y: c1[1], z: c1[2]}, sphere2: {x: c2[0], y: c2[1], z: c2[2]}, sphere3: {x: c3[0], y: c3[1], z: c3[2]}, sphere4: {x: c4[0], y: c4[1], z: c4[2]}};
}

function recursiveGeneration(base_circle1, base_circle2, base_circle3, curr_stage) {
    // generate new circles based on the previous three, make sure all permutations of three circles are covered
    if (curr_stage === 0) {
        return;
    }
    else {
        // generate circle tangent to the other three regions
        let new_circle1 = generateNewCircle1(base_circle1.x, base_circle1.y, base_circle1.radius, base_circle2.x, base_circle2.y, base_circle2.radius, base_circle3.x, base_circle3.y, base_circle3.radius, curr_stage-1);

        // call recursiveGeneration on each triple of tangent circles
        recursiveGeneration(base_circle1, base_circle2, new_circle1, curr_stage - 1);
        recursiveGeneration(base_circle1, new_circle1, base_circle3, curr_stage - 1);
        recursiveGeneration(new_circle1, base_circle2, base_circle3, curr_stage - 1);

    }
}

let { circle1: base_circle1, circle2: base_circle2, circle3: base_circle3 } = generateBaseCircles();
let innerCircle = generateNewCircle1(base_circle1.x, base_circle1.y, base_circle1.radius, base_circle2.x, base_circle2.y, base_circle2.radius, base_circle3.x, base_circle3.y, base_circle3.radius, stage);
let outerCircle = generateNewCircle2(base_circle1.x, base_circle1.y, base_circle1.radius, base_circle2.x, base_circle2.y, base_circle2.radius, base_circle3.x, base_circle3.y, base_circle3.radius, stage);
// draw initial 5 circles
createCircle(base_circle1.radius, {x: base_circle1.x, y: base_circle1.y, z: 0}, stage);
createCircle(base_circle2.radius, {x: base_circle2.x, y: base_circle2.y, z: 0}, stage);
createCircle(base_circle3.radius, {x: base_circle3.x, y: base_circle3.y, z: 0}, stage);
createCircle(innerCircle.radius, {x: innerCircle.x, y: innerCircle.y, z: 0}, stage);
createCircle(outerCircle.radius, {x: outerCircle.x, y: outerCircle.y, z: 0}, stage);


// draw initial circles
recursiveGeneration(base_circle1, base_circle2, innerCircle, stage);
recursiveGeneration(base_circle1, base_circle2, outerCircle, stage);
recursiveGeneration(base_circle1, base_circle3, innerCircle, stage);
recursiveGeneration(base_circle1, base_circle3, outerCircle, stage);
recursiveGeneration(base_circle2, base_circle3, innerCircle, stage);
recursiveGeneration(base_circle2, base_circle3, outerCircle, stage);

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	console.log(camera, camera instanceof THREE.Camera);
    renderer.render(scene, camera);

}

animate()