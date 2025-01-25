import * as THREE from "three";
import { CelestialBody } from "../CelestialBody";
import { Physics } from "../Physics";

const ThreeBodyScene = (solutionIndex: number = 1) => {
  const scene = new THREE.Scene();

  // Add ambient lighting to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Color, Intensity
  scene.add(ambientLight);

  const planetMass = 1e20;

  // Array of solutions
  const solutions = [
    {
      name: "Figure Eight",
      positions: [
        new THREE.Vector3(970.0436 * 6.5, 0, -243.08753 * 6.5), // Adjusted for XZ plane
        new THREE.Vector3(-970.0436 * 6.5, 0, 243.08753 * 6.5), // Adjusted for XZ plane
        new THREE.Vector3(0, 0, 0), // Center point
      ],
      velocities: [
        new THREE.Vector3(466.203685 * 1, 0, 432.36573 * 1), // Adjusted for XZ plane
        new THREE.Vector3(466.203685 * 1, 0, 432.36573 * 1), // Adjusted for XZ plane
        new THREE.Vector3(-2 * 466.203685 * 1, 0, -2 * 432.36573 * 1), // Adjusted for XZ plane
      ],
    },
    {
      name: "Butterfly Choreography",
      positions: [
        new THREE.Vector3(3000, 0, 0), // XZ plane
        new THREE.Vector3(-3000, 0, 3660), // XZ plane
        new THREE.Vector3(-3000, 0, -3660), // XZ plane
      ],
      velocities: [
        new THREE.Vector3(400, 0, -100), // Motion in XZ plane
        new THREE.Vector3(-233, 0, -100), // Motion in XZ plane
        new THREE.Vector3(-33, 0, 250), // Motion in XZ plane
      ],
    },
    {
      name: "Isosceles Triangle",
      positions: [
        new THREE.Vector3(9700, 0, 0), // XZ plane
        new THREE.Vector3(-4850, 0, 8411), // XZ plane
        new THREE.Vector3(-4850, 0, -8411), // XZ plane
      ],
      velocities: [
        new THREE.Vector3(0, 0, -243), // Motion in XZ plane
        new THREE.Vector3(466, 0, 121), // Motion in XZ plane
        new THREE.Vector3(-466, 0, 121), // Motion in XZ plane
      ],
    },
  ];

  // const solutionIndex = 1; // Change this to select a different solution

  // Select the solution
  const solution = solutions[solutionIndex];

  if (!solution) {
    throw new Error(`Invalid solution index: ${solutionIndex}`);
  }

  // Create planets based on the selected solution
  const redPlanet = new CelestialBody({
    size: 400,
    color: 0xff0000,
    mass: planetMass,
    name: "Red Planet",
  });
  redPlanet.setPosition(
    solution.positions[0].x,
    solution.positions[0].y,
    solution.positions[0].z
  );
  redPlanet.setVelocity(solution.velocities[0]);
  redPlanet.addToScene(scene);

  const bluePlanet = new CelestialBody({
    size: 400,
    color: 0x0000ff,
    mass: planetMass,
    name: "Blue Planet",
  });
  bluePlanet.setPosition(
    solution.positions[1].x,
    solution.positions[1].y,
    solution.positions[1].z
  );
  bluePlanet.setVelocity(solution.velocities[1]);
  bluePlanet.addToScene(scene);

  const greenPlanet = new CelestialBody({
    size: 400,
    color: 0x00ff00,
    mass: planetMass,
    name: "Green Planet",
  });
  greenPlanet.setPosition(
    solution.positions[2].x,
    solution.positions[2].y,
    solution.positions[2].z
  );
  greenPlanet.setVelocity(solution.velocities[2]);
  greenPlanet.addToScene(scene);

  const physics = new Physics([redPlanet, bluePlanet, greenPlanet]);

  const updateLoop = (
    deltaTime: number,
    camera: THREE.PerspectiveCamera | undefined = undefined
  ) => {
    physics.simulate(deltaTime * 2);
    if (camera) {
      // Move camera to follow the average position of the planets
      const averagePosition = new THREE.Vector3()
        .addVectors(redPlanet.position, bluePlanet.position)
        .add(greenPlanet.position)
        .divideScalar(3);
      camera.position.set(
        averagePosition.x,
        camera.position.y,
        averagePosition.z + 1000
      );
    }
  };

  return { scene, updateLoop };
};

export default ThreeBodyScene;
