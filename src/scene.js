import * as THREE from "https://unpkg.com/three@0.168.0/build/three.module.js";

const canvas = document.querySelector("#liquidScene");

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance"
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 7.2);

const geometry = new THREE.IcosahedronGeometry(2.1, 42);
const basePositions = geometry.attributes.position.array.slice();
const material = new THREE.MeshPhysicalMaterial({
  color: 0xa9fff0,
  metalness: 1,
  roughness: 0.18,
  transmission: 0.22,
  thickness: 1.4,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  iridescence: 0.78,
  iridescenceIOR: 1.8,
  envMapIntensity: 1.6
});

const blob = new THREE.Mesh(geometry, material);
blob.position.set(2.5, 0.7, -0.8);
scene.add(blob);

const wire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.16, 2),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.07,
    wireframe: true
  })
);
wire.position.copy(blob.position);
scene.add(wire);

const ambient = new THREE.AmbientLight(0x7dfff0, 1.8);
const key = new THREE.PointLight(0xffffff, 38, 20);
const rim = new THREE.PointLight(0x61f7a7, 24, 18);
const cool = new THREE.PointLight(0x6bd6ff, 18, 16);
key.position.set(-4, 3, 5);
rim.position.set(5, -2, 3);
cool.position.set(0, 4, -2);
scene.add(ambient, key, rim, cool);

const particles = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: 0xd8fff5,
    size: 0.018,
    transparent: true,
    opacity: 0.34
  })
);

const particlePositions = new Float32Array(900);
for (let index = 0; index < particlePositions.length; index += 3) {
  particlePositions[index] = (Math.random() - 0.5) * 12;
  particlePositions[index + 1] = (Math.random() - 0.5) * 8;
  particlePositions[index + 2] = (Math.random() - 0.5) * 5;
}
particles.geometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
scene.add(particles);

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate(time) {
  const seconds = time * 0.001;
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const baseIndex = index * 3;
    const x = basePositions[baseIndex];
    const y = basePositions[baseIndex + 1];
    const z = basePositions[baseIndex + 2];
    const wave = Math.sin(x * 2.1 + seconds * 1.4) * 0.035
      + Math.cos(y * 2.7 + seconds * 1.1) * 0.03
      + Math.sin(z * 2.5 + seconds * 1.8) * 0.025;
    const length = Math.sqrt(x * x + y * y + z * z) || 1;
    positions.setXYZ(
      index,
      x + (x / length) * wave,
      y + (y / length) * wave,
      z + (z / length) * wave
    );
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  blob.rotation.x = seconds * 0.16;
  blob.rotation.y = seconds * 0.22;
  wire.rotation.copy(blob.rotation);
  particles.rotation.y = seconds * 0.025;

  const pointerX = (window.stocklanaPointer?.x || 0) * 0.35;
  const pointerY = (window.stocklanaPointer?.y || 0) * 0.25;
  blob.position.x = 2.5 + pointerX;
  blob.position.y = 0.7 + pointerY;
  wire.position.copy(blob.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.stocklanaPointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (event) => {
  window.stocklanaPointer.x = event.clientX / window.innerWidth - 0.5;
  window.stocklanaPointer.y = -(event.clientY / window.innerHeight - 0.5);
});
window.addEventListener("resize", resize);

resize();
requestAnimationFrame(animate);
