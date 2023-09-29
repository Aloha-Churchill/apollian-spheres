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


// generate a map from stage number to a unique and distinct color
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

function createSphere(radius, position, color = new THREE.Color(`rgb(255, 255, 255)`)) {
    // const color = radiusToColor(radius);
    // set const color to white
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(position.x, position.y, position.z);
    scene.add(sphere);
}

function findCentroid(sphere1, sphere2, sphere3, sphere4, new_radius) {
    
    const equations = [
        `sqrt((x - ${sphere1.x})^2 + (y - ${sphere1.y})^2 + (z - ${sphere1.z})^2) = ${sphere1.radius} + ${new_radius}`,
        `sqrt((x - ${sphere2.x})^2 + (y - ${sphere2.y})^2 + (z - ${sphere2.z})^2) = ${sphere2.radius} + ${new_radius}`,
        `sqrt((x - ${sphere3.x})^2 + (y - ${sphere3.y})^2 + (z - ${sphere3.z})^2) = ${sphere3.radius} + ${new_radius}`,
        `sqrt((x - ${sphere4.x})^2 + (y - ${sphere4.y})^2 + (z - ${sphere4.z})^2) = ${sphere4.radius} + ${new_radius}`
    ]

    // const solution = math.solve(equations, ['x', 'y', 'z']);

    // return {x: solution.x, y: solution.y, z: solution.z};

    return {x: 0, y: 0, z: 0};
}
// based on four spheres, generate a new sphere tangent to all four
function generateNewSphere(sphere1, sphere2, sphere3, sphere4) {
    //  use Descarte's theorem to find the curvature of the new sphere
    const k_sum = sphere1.curvature + sphere2.curvature + sphere3.curvature + sphere4.curvature;
    const k_sqrt_sum = 2 * Math.sqrt(sphere1.curvature * sphere2.curvature + sphere1.curvature * sphere3.curvature + sphere1.curvature * sphere4.curvature + sphere2.curvature * sphere3.curvature + sphere2.curvature * sphere4.curvature + sphere3.curvature * sphere4.curvature);

    const curvature = k_sum + k_sqrt_sum;

    const new_radius = 1 / curvature;

    // call findCentroid
    const centroid = findCentroid(sphere1, sphere2, sphere3, sphere4, new_radius);

    // return the new sphere as x,y,z, radius, curvature objects
    return {centroid: centroid, radius: new_radius, curvature: curvature};

}

function generateBaseSpheres(side_length) {

    // Generate vertices of an equilateral tetrahedron
    const c1 = {x: side_length/2, y: 0, z: -(side_length/2)/Math.sqrt(2)};
    const c2 = {x: -side_length/2, y: 0, z: -(side_length/2)/Math.sqrt(2)};
    const c3 = {x: 0, y: side_length/2, z: (side_length/2)/Math.sqrt(2)};
    const c4 = {x: 0, y: -side_length/2, z: (side_length/2)/Math.sqrt(2)};
    
    const radius = side_length / 2;
    const curvature = 1 / radius;

    // Use Descarte's theorem to find the curvature of the inner/outer spheres
    const k_sum = 4 * curvature;
    const k_sqrt_sum = 2 * Math.sqrt(6 * curvature * curvature);  // Simplified from 6 combinations of k1k2, k1k3, ...

    const outer_curvature = k_sum + k_sqrt_sum;
    const inner_curvature = k_sum - k_sqrt_sum;

    const outer_radius = 2 / outer_curvature;
    const inner_radius = 2 / inner_curvature;

    // find the centroid of the tetrahedron
    const centroid = {x: 0, y: 0, z: 0};

    // return the four vertices as x,y,z, radius, curvature objects
    return {
        sphere1: {centroid: c1, radius: radius, curvature: curvature},
        sphere2: {centroid: c2, radius: radius, curvature: curvature},
        sphere3: {centroid: c3, radius: radius, curvature: curvature},
        sphere4: {centroid: c4, radius: radius, curvature: curvature},
        outer_sphere: {centroid: centroid, radius: outer_radius, curvature: outer_curvature},
        inner_sphere: {centroid: centroid, radius: inner_radius, curvature: inner_curvature}
    };
}

// generate the four base spheres & outer and inner spheres
let {sphere1: base_sphere1, sphere2: base_sphere2, sphere3: base_sphere3, sphere4: base_sphere4, outer_sphere: outer_sphere, inner_sphere: inner_sphere} = generateBaseSpheres(2);

// draw the four base spheres
createSphere(base_sphere1.radius, base_sphere1.centroid);
createSphere(base_sphere2.radius, base_sphere2.centroid);
createSphere(base_sphere3.radius, base_sphere3.centroid);
createSphere(base_sphere4.radius, base_sphere4.centroid);

// draw the outer and inner spheres
createSphere(outer_sphere.radius, outer_sphere.centroid, new THREE.Color(`rgb(255, 0, 0)`));
createSphere(inner_sphere.radius, inner_sphere.centroid, new THREE.Color(`rgb(255, 0, 0)`));

// generate the first sphere
let sphere5 = generateNewSphere(base_sphere1, base_sphere2, base_sphere3, outer_sphere);
createSphere(sphere5.radius, sphere5.centroid, new THREE.Color(`rgb(0, 0, 255)`));


function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

animate();