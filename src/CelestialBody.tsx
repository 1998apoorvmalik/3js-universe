import * as THREE from "three";

export class CelestialBody {
  public bodyMesh: THREE.Mesh;
  public mass: number;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public name: string;
  public type: "universal" | "sun" | "planet" | "moon"; // Added type property

  private light?: THREE.PointLight;
  private isEmissive: boolean;

  constructor({
    texturePath = null,
    size = 5,
    intensity = 2,
    color = 0xffffff,
    isEmissive = false,
    mass = 1,
    name = "CelestialBody",
    type = "universal", // Default type is planet
  }: {
    texturePath?: string | null;
    size?: number;
    intensity?: number;
    color?: number;
    isEmissive?: boolean;
    mass?: number;
    name?: string;
    type?: "universal" | "sun" | "planet" | "moon";
  }) {
    // Create the celestial body geometry
    const geometry = new THREE.SphereGeometry(size, 64, 64);

    // Load the texture or use a default color material
    const textureLoader = new THREE.TextureLoader();
    const material = texturePath
      ? new THREE.MeshBasicMaterial({
          map: textureLoader.load(texturePath),
        })
      : new THREE.MeshBasicMaterial({ color });

    // Create the body mesh
    this.bodyMesh = new THREE.Mesh(geometry, material);

    this.isEmissive = isEmissive;
    this.mass = mass;
    this.position = this.bodyMesh.position;
    this.velocity = new THREE.Vector3(); // Initialize velocity as zero vector
    this.name = name;
    this.type = type; // Assign the type

    if (this.isEmissive) {
      // Create a point light if this is an emissive body (e.g., a sun)
      this.light = new THREE.PointLight(color, intensity);
      this.light.castShadow = true;
      this.light.shadow.mapSize.width = 2048; // Higher resolution shadow map
      this.light.shadow.mapSize.height = 2048;

      // Position the light at the body's position
      this.light.position.copy(this.bodyMesh.position);
    }
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.bodyMesh);
    if (this.light) {
      scene.add(this.light);
    }
  }

  public setPosition(x: number, y: number, z: number): void {
    this.bodyMesh.position.set(x, y, z);
    if (this.light) {
      this.light.position.set(x, y, z);
    }
  }

  public setVelocity(velocity: THREE.Vector3): void {
    this.velocity.copy(velocity);
  }

  public setIntensity(intensity: number): void {
    if (this.light) {
      this.light.intensity = intensity;
    }
  }

  public update(rotationSpeed: number = 0.01): void {
    // Add animations or updates for the celestial body here, such as rotation
    this.bodyMesh.rotation.y += rotationSpeed; // Example: slow rotation
  }

  public dispose(): void {
    // Clean up resources
    this.bodyMesh.geometry.dispose();
    if (this.bodyMesh.material instanceof THREE.Material) {
      this.bodyMesh.material.dispose();
    }
    if (this.light) {
      this.light.dispose();
    }
  }
}
