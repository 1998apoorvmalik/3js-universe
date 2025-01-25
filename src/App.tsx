import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import "./App.css";
import SolarSystemScene from "./scenes/SolarSystem";
import ThreeBodyScene from "./scenes/ThreeBody";
import { Universe } from "./Universe";

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));

  const [envName, setEnvName] = useState<"Solar System" | "Three Body">(
    "Solar System"
  );
  const [threeBodySolutionIndex, setThreeBodySolutionIndex] = useState(1);

  var camera = 1;

  const playerCamera = useRef(
    new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    )
  );

  const worldCamera = useRef(
    new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    )
  );

  // Initialization
  useEffect(() => {
    const env =
      envName === "Solar System"
        ? SolarSystemScene()
        : ThreeBodyScene(threeBodySolutionIndex);
    const scene = env.scene;

    // Set up renderer and camera
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    renderer.current.setPixelRatio(window.devicePixelRatio); // Ensure high resolution on retina displays
    renderer.current.domElement.style.display = "block"; // Remove any default padding/margin
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.current.domElement);
    }

    playerCamera.current.position.z = -5;
    worldCamera.current.position.y = 10000;
    worldCamera.current.lookAt(scene.position);

    // Setup Universe
    const universe = new Universe(scene, "/assets/textures/starfield2.bmp");

    // Create player
    const player = new Player(
      scene,
      playerCamera.current,
      containerRef.current as HTMLElement
    );

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      const deltaTime = clock.getDelta(); // Time since last frame
      universe.update(0.004); // ~60FPS
      player.update(deltaTime);
      env.updateLoop(deltaTime);

      renderer.current.render(
        scene,
        camera === 0 ? playerCamera.current : worldCamera.current
      );
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.current.setSize(width, height);

      worldCamera.current.aspect = width / height;
      worldCamera.current.updateProjectionMatrix();
      playerCamera.current.aspect = width / height;
      playerCamera.current.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup the event listener
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.innerHTML = ""; // Clear the container on cleanup
      }
    };
  }, [envName, threeBodySolutionIndex]);

  // Handle key presses
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault(); // Prevent default tab behavior
        setEnvName((prevEnvName) =>
          prevEnvName === "Solar System" ? "Three Body" : "Solar System"
        );
      } else if (event.key.toLowerCase() === "v") {
        camera = Math.abs(camera - 1);
      } else if (event.key.toLowerCase() === "1") {
        setThreeBodySolutionIndex(0);
      } else if (event.key.toLowerCase() === "2") {
        setThreeBodySolutionIndex(1);
      } else if (event.key.toLowerCase() === "3") {
        setThreeBodySolutionIndex(2);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return <div ref={containerRef} className="fullscreen"></div>;
}

export default App;
