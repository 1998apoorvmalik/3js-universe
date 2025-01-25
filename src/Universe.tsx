import * as THREE from "three";

export class Universe {
  private universeMesh: THREE.Mesh;

  constructor(scene: THREE.Scene, texturePath: string, radius: number = 15000) {
    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const starTexture = textureLoader.load(texturePath);

    // Create the sphere geometry
    const geometry = new THREE.SphereGeometry(radius, 256, 256);

    // Create the material for the inside of the sphere
    const material = new THREE.MeshBasicMaterial({
      map: starTexture, // Use the provided texture
      side: THREE.BackSide, // Render the texture on the inside
    });

    // Create the sphere mesh
    this.universeMesh = new THREE.Mesh(geometry, material);

    // Add the sphere to the scene
    scene.add(this.universeMesh);
  }

  // Optional: Update method for visual effects
  public update(deltaTime: number): void {
    this.universeMesh.rotation.y += deltaTime * 0.01; // Rotate slowly for a dynamic effect
  }
}
