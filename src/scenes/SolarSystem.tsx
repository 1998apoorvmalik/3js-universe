import * as THREE from "three";
import { CelestialBody } from "../CelestialBody";
import { Physics } from "../Physics";

const SolarSystemScene = () => {
  const scene = new THREE.Scene();

  // Add ambient lighting to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Color, Intensity
  scene.add(ambientLight);

  // Create a sun
  const sun = new CelestialBody({
    texturePath: "/assets/textures/sun.jpg",
    size: 500,
    intensity: 2,
    color: 0xffcc33,
    isEmissive: true,
    mass: 1e20,
    name: "Sun",
    type: "sun",
  });
  sun.setPosition(0, 0, 0);
  sun.addToScene(scene);

  // add a green cube
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0);
  scene.add(cube);

  // Create Mercury
  const mercury = new CelestialBody({
    texturePath: "/assets/textures/mercury.jpg",
    size: 50,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Mercury",
    type: "planet",
  });

  mercury.setPosition(-1000, 0, 0);
  mercury.addToScene(scene);
  mercury.setVelocity(new THREE.Vector3(0, 0, -2400)); // Mercury's orbital velocity in m/s

  // Create Venus

  const venus = new CelestialBody({
    texturePath: "/assets/textures/venus.jpg",
    size: 75,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Venus",
    type: "planet",
  });

  venus.setPosition(-2000, 0, 0);
  venus.addToScene(scene);
  venus.setVelocity(new THREE.Vector3(0, 0, -1600)); // Venus's orbital velocity in m/s

  // Create Earth
  const earth = new CelestialBody({
    texturePath: "/assets/textures/earth.jpg",
    size: 100,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 1e19 * 1.9,
    name: "Earth",
    type: "planet",
  });
  earth.setPosition(-3000, 0, 0);
  earth.addToScene(scene);
  earth.setVelocity(new THREE.Vector3(0, 0, -1500)); // Earth's orbital velocity in m/s

  // Add a moon to the Earth
  const earthMoon = new CelestialBody({
    texturePath: "/assets/textures/earth-moon.jpg",
    size: 30,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Earth-Moon",
    type: "moon",
  });

  earthMoon.setPosition(-3500, 0, 0);
  earthMoon.addToScene(scene);
  earthMoon.setVelocity(new THREE.Vector3(0, 100, -100));

  // Create Mars
  const mars = new CelestialBody({
    texturePath: "/assets/textures/mars.bmp",
    size: 60,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Mars",
    type: "planet",
  });
  mars.setPosition(-4500, 0, 0);
  mars.addToScene(scene);
  mars.setVelocity(new THREE.Vector3(0, 0, -1200));

  // Create Jupiter
  const jupiter = new CelestialBody({
    texturePath: "/assets/textures/jupiter.bmp",
    size: 300,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Jupiter",
    type: "planet",
  });
  jupiter.setPosition(-6200, 0, 0);
  jupiter.addToScene(scene);
  jupiter.setVelocity(new THREE.Vector3(0, 0, -900));

  // Create Saturn
  const saturn = new CelestialBody({
    texturePath: "/assets/textures/saturn.bmp",
    size: 200,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Saturn",
    type: "planet",
  });
  saturn.setPosition(-8000, 0, 0);
  saturn.addToScene(scene);
  saturn.setVelocity(new THREE.Vector3(0, 0, -800));

  // Create Uranus
  const uranus = new CelestialBody({
    texturePath: "/assets/textures/uranus.bmp",
    size: 150,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Uranus",
    type: "planet",
  });
  uranus.setPosition(-10000, 0, 0);
  uranus.addToScene(scene);
  uranus.setVelocity(new THREE.Vector3(0, 0, -800));

  // Create Neptune
  const neptune = new CelestialBody({
    texturePath: "/assets/textures/neptune.bmp",
    size: 150,
    intensity: 0,
    color: 0x000000,
    isEmissive: false,
    mass: 100,
    name: "Neptune",
    type: "planet",
  });
  neptune.setPosition(-11000, 0, 0);
  neptune.addToScene(scene);
  neptune.setVelocity(new THREE.Vector3(0, 0, -800));

  const physics = new Physics([
    sun,
    mercury,
    venus,
    earth,
    earthMoon,
    mars,
    jupiter,
    saturn,
    uranus,
    neptune,
  ]);

  const updateLoop = (deltaTime: number) => {
    physics.simulate(deltaTime * 0.2);
    sun.update(0.0002);
    mercury.update(0.001);
    venus.update(-0.001);
    earth.update(0.01);
    earthMoon.update(0.001);
    mars.update(0.01);
    jupiter.update(0.025);
    saturn.update(0.025);
    uranus.update(0.015);
    neptune.update(0.015);
  };

  return { scene, updateLoop };
};

export default SolarSystemScene;
