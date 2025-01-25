import * as THREE from "three";
import { CelestialBody } from "./CelestialBody";

export class Physics {
  private bodies: CelestialBody[];
  private gravitationalConstant: number;
  private softeningFactor: number;
  private maxForce: number;
  private collisionThreshold: number;

  constructor(
    bodies: CelestialBody[],
    gravitationalConstant: number = 6.6743e-11,
    softeningFactor: number = 1e-3,
    maxForce: number = 1e24,
    collisionThreshold: number = 1e-2
  ) {
    this.bodies = bodies;
    this.gravitationalConstant = gravitationalConstant;
    this.softeningFactor = softeningFactor;
    this.maxForce = maxForce;
    this.collisionThreshold = collisionThreshold;
  }

  private shouldAffect(bodyA: CelestialBody, bodyB: CelestialBody): boolean {
    // Define interaction rules
    switch (bodyA.type) {
      case "sun":
        return false; // Sun is not affected by any other body
      case "planet":
        return bodyB.type === "sun"; // Planets are only affected by the sun
      case "moon":
        return bodyB.type === "planet" || bodyB.type === "sun"; // Moons are only affected by planets
      case "universal":
        return true; // Universals are affected by all other bodies
      default:
        return false;
    }
  }

  public applyGravity(deltaTime: number): void {
    for (let i = 0; i < this.bodies.length; i++) {
      const bodyA = this.bodies[i];
      for (let j = 0; j < this.bodies.length; j++) {
        if (i === j || !this.shouldAffect(bodyA, this.bodies[j])) continue; // Skip self-interaction and non-applicable interactions

        const bodyB = this.bodies[j];

        // Compute the distance vector
        const distanceVector = new THREE.Vector3().subVectors(
          bodyB.position,
          bodyA.position
        );
        const distance = distanceVector.length();

        if (distance === 0 || distance < this.collisionThreshold) {
          // Handle collision
          const combinedMass = bodyA.mass + bodyB.mass;

          bodyA.velocity
            .multiplyScalar(bodyA.mass)
            .add(bodyB.velocity.clone().multiplyScalar(bodyB.mass))
            .divideScalar(combinedMass);

          bodyA.mass = combinedMass;
          this.bodies.splice(j, 1);
          continue;
        }

        // Compute softened distance
        const softenedDistance = Math.sqrt(
          distance * distance + this.softeningFactor * this.softeningFactor
        );

        // Compute gravitational force magnitude with maxForce cap
        const forceMagnitude = Math.min(
          (this.gravitationalConstant * bodyA.mass * bodyB.mass) /
            (softenedDistance * softenedDistance),
          this.maxForce
        );

        // Compute force vector
        const forceVector = distanceVector
          .normalize()
          .multiplyScalar(forceMagnitude);

        // Apply the force to bodyA's velocity
        const acceleration = forceVector.divideScalar(bodyA.mass);

        bodyA.velocity.add(acceleration.multiplyScalar(deltaTime));
      }
    }
  }

  public updatePositions(deltaTime: number): void {
    this.bodies.forEach((body) => {
      // Update the position based on velocity
      const positionChange = body.velocity.clone().multiplyScalar(deltaTime);
      body.position.add(positionChange);
    });
  }

  public simulate(deltaTime: number): void {
    this.applyGravity(deltaTime);
    this.updatePositions(deltaTime);
  }
}
