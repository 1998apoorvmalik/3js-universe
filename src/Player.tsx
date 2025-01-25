import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

export class Player {
  public model: THREE.Object3D | null = null;

  private controls: {
    pitch: number; // Forward/backward tilt
    roll: number; // Sideways tilt
    yaw: number; // Rotation
    throttle: number; // Vertical movement
  } = {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle: 0,
  };

  private targetControls: {
    pitch: number;
    roll: number;
    yaw: number;
    throttle: number;
  } = {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle: 0,
  };

  private boostMultiplier = 3; // Boost multiplier for speed
  private isBoosting = false; // Flag to check if boosting
  private rotationSpeedMultiplier = 3; // Base rotation speed
  private translationSpeedMultiplier = 500; // Base movement speed
  private mouseSensitivity = 0.002; // Camera rotation sensitivity
  private cameraRotation = new THREE.Vector2(); // Horizontal and vertical rotation angles

  private freeCamera = false; // Flag to recenter the camera

  // private mouseIdleTimer: any;
  // private isMouseActive = false; // Flag to check if the mouse is active

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.Camera,
    private domElement: HTMLElement
  ) {
    this.loadModel();
    this.setupKeyboardControls();
    this.setupMouseControls();
  }

  private loadModel() {
    const loader = new FBXLoader();
  
    // Define the material properties that correspond to each texture
    const textureProperties = [
      "map", // Diffuse Map (Base Color)
      "normalMap", // Normal Map
      "metalnessMap", // Metalness Map
      "roughnessMap", // Roughness Map
    ];
  
    // Array of texture paths
    const texturePaths = [
      "/models/ship/texture/Ship_Base_color.png",
      "/models/ship/texture/Ship_Line.png",
      "/models/ship/texture/Ship_Emissive.png",
      "/models/ship/texture/Ship_Roughness.png",
    ];
  
    loader.load(
      "/models/ship/ship.fbx",
      (fbx) => {
        this.model = fbx;
        this.model.scale.set(0.01, 0.01, 0.01); // Scale the model
        this.model.position.set(500, 500, 500); // Set the initial position

  
        // Load all textures dynamically
        const textureLoader = new THREE.TextureLoader();
        const textures: Record<string, THREE.Texture> = {};
        texturePaths.forEach((path, index) => {
          const property = textureProperties[index];
          textures[property] = textureLoader.load(path);
        });
  
        // Apply the loaded textures to all meshes in the FBX model
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Update the existing material with all textures
              for (const [property, texture] of Object.entries(textures)) {
                (child.material as any)[property] = texture;
              }
  
              child.material.metalness = 1; // Ensure metallic behavior
              child.material.roughness = 0.5; // Adjust roughness as needed
              child.material.needsUpdate = true;
            } else {
              // Create a new material if none exists
              child.material = new THREE.MeshStandardMaterial({
                ...textures, // Spread the texture properties
                metalness: 1,
                roughness: 0.5,
              });
            }
          }
        });
  
        // Add the model to the scene
        this.scene.add(this.model);
      },
      undefined,
      (error) => {
        console.error("Error loading player model:", error);
      }
    );
  }
  private setupKeyboardControls() {
    window.addEventListener("keydown", (event) => this.onKeyDown(event));
    window.addEventListener("keyup", (event) => this.onKeyUp(event));
  }

  // Setup mouse controls with Pointer Lock
  private setupMouseControls() {
    this.domElement.addEventListener("click", () => {
      this.domElement.requestPointerLock();
    });

    window.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === this.domElement) {
        this.cameraRotation.x -= event.movementX * this.mouseSensitivity;
        this.cameraRotation.y -= event.movementY * this.mouseSensitivity;

        // this.isMouseActive = true; // Mouse is controlling the camera

        // clearTimeout(this.mouseIdleTimer);

        // this.mouseIdleTimer = setTimeout(() => {
        //   if (this.targetControls.throttle !== 0) {
        //     this.isMouseActive = false; // Mouse is at rest after inactivity
        //   }
        // }, 1000); // Reset mouse activity after 200ms of no movement
      }
    });
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "w":
        this.targetControls.pitch = 1; // Forward tilt
        break;
      case "s":
        this.targetControls.pitch = -1; // Backward tilt
        break;
      case "a":
        this.targetControls.roll = -1; // Left tilt
        break;
      case "d":
        this.targetControls.roll = 1; // Right tilt
        break;
      case "i":
        this.targetControls.throttle = 1; // Increase altitude
        break;
      case "k":
        this.targetControls.throttle = -1; // Decrease altitude
        break;
      case "j":
        this.targetControls.yaw = 1; // Rotate left
        break;
      case "l":
        this.targetControls.yaw = -1; // Rotate right
        break;
      case "c":
        this.freeCamera = !this.freeCamera; // Toggle free camera
        break;
      case "Shift": // Activate boost
        this.isBoosting = !this.isBoosting;
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "w":
      case "s":
        this.targetControls.pitch = 0;
        break;
      case "a":
      case "d":
        this.targetControls.roll = 0;
        break;
      case "i":
      case "k":
        this.targetControls.throttle = 0;
        break;
      case "j":
      case "l":
        this.targetControls.yaw = 0;
        break;
    }
  }

  private smoothTransition() {
    for (const key in this.controls) {
      const controlKey = key as keyof typeof this.controls;
      this.controls[controlKey] +=
        (this.targetControls[controlKey] - this.controls[controlKey]) * 0.1; // Transition speed
    }
  }

  private rotate(deltaTime: number) {
    if (!this.model) return;

    // Calculate rotation movement
    const pitchMovement =
      this.controls.pitch * this.rotationSpeedMultiplier * deltaTime;
    const rollMovement =
      this.controls.roll * this.rotationSpeedMultiplier * deltaTime;
    const yawMovement =
      this.controls.yaw * this.rotationSpeedMultiplier * deltaTime;

    // Create quaternions for each rotation axis
    const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0), // Local X-axis (pitch)
      pitchMovement
    );
    const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1), // Local Z-axis (roll)
      rollMovement
    );
    const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0), // Local Y-axis (yaw)
      yawMovement
    );

    // Combine the rotations
    this.model.quaternion
      .multiply(yawQuaternion)
      .multiply(pitchQuaternion)
      .multiply(rollQuaternion);
  }

  private handleGamepadInput() {
    const gamepads = navigator.getGamepads();
    if (!gamepads || !gamepads[0]) return; // No gamepad connected

    const gamepad = gamepads[0]; // Use the first connected gamepad
    const deadzone = 0.1; // Deadzone to ignore small stick movements

    // Map the left stick to pitch and roll
    const leftStickX = gamepad.axes[0]; // Left stick horizontal (roll)
    const leftStickY = gamepad.axes[1]; // Left stick vertical (pitch)

    this.targetControls.roll = Math.abs(leftStickX) > deadzone ? leftStickX : 0; // Roll control
    this.targetControls.pitch =
      Math.abs(leftStickY) > deadzone ? -leftStickY : 0; // Invert for pitch control

    // Map L1 and R1 to yaw
    const isL1Pressed = gamepad.buttons[4].pressed; // L1 button
    const isR1Pressed = gamepad.buttons[5].pressed; // R1 button
    this.targetControls.yaw = isL1Pressed ? 1 : isR1Pressed ? -1 : 0; // Yaw control

    // Map L2 and R2 to throttle
    const leftTrigger = gamepad.buttons[6].value; // L2 (reverse throttle)
    const rightTrigger = gamepad.buttons[7].value; // R2 (forward throttle)
    this.targetControls.throttle = rightTrigger - leftTrigger;

    // // Map L3 for boost mode
    // if (gamepad.buttons[10].pressed) {
    //   this.isBoosting = !this.isBoosting; // L3 button (boost)
    // }
    // // Toggle free camera with R3
    // if (gamepad.buttons[11].pressed) {
    //   this.freeCamera = !this.freeCamera;
    // }

    // Enable free camera on right button (R3 equivalent)
    if (gamepad.buttons[14].pressed) {
      this.freeCamera = true;
    }

    // Disable free camera on left button (L3 equivalent)
    if (gamepad.buttons[15].pressed) {
      this.freeCamera = false;
    }

    // Enable boost on up button
    if (gamepad.buttons[12].pressed) {
      this.isBoosting = true;
    }

    // Disable boost on down button
    if (gamepad.buttons[13].pressed) {
      this.isBoosting = false;
    }

    // Use the right stick for free camera control
    if (this.freeCamera) {
      const rightStickX = gamepad.axes[2]; // Right stick horizontal
      const rightStickY = gamepad.axes[3]; // Right stick vertical

      if (Math.abs(rightStickX) > deadzone) {
        this.cameraRotation.x -= rightStickX * this.mouseSensitivity * 10; // Adjust horizontal rotation
      }

      if (Math.abs(rightStickY) > deadzone) {
        this.cameraRotation.y -= rightStickY * this.mouseSensitivity * 10; // Adjust vertical rotation
      }

      // Prevent flipping by clamping the vertical rotation
      // this.cameraRotation.y = THREE.MathUtils.clamp(
      //   this.cameraRotation.y,
      //   -Math.PI / 2 + 0.01,
      //   Math.PI / 2 - 0.01
      // );
    }
  }

  public update(deltaTime: number) {
    if (!this.model) return;

    // Smoothly transition inputs
    this.smoothTransition();

    // Handle PS5 controller input
    this.handleGamepadInput();

    // Compute throttle direction in the local space of the model
    const throttleDirection = new THREE.Vector3(0, 0, 1); // Local Z-axis
    throttleDirection.applyQuaternion(this.model.quaternion);
    throttleDirection.normalize();

    // Apply boost multiplier
    const boost = this.isBoosting ? this.boostMultiplier : 1;

    // Apply throttle movement
    const throttleMovement =
      this.controls.throttle *
      this.translationSpeedMultiplier *
      boost *
      deltaTime;
    const throttleOffset = throttleDirection.multiplyScalar(throttleMovement);

    this.model.position.add(throttleOffset); // Move the ship in the throttle direction

    // Handle rotation
    this.rotate(deltaTime);

    // Handle camera movement
    const distance = -0.6 * 10; // Distance behind the ship
    const heightOffset = 0.2 * 10; // Height above the ship

    if (this.freeCamera) {
      // Clamp vertical rotation to prevent flipping
      this.cameraRotation.y = THREE.MathUtils.clamp(
        this.cameraRotation.y,
        -Math.PI / 2 + 0.01, // Prevent looking directly up
        Math.PI / 2 - 0.01 // Prevent looking directly down
      );

      // Calculate camera offset in the world coordinate system
      const offsetX =
        distance *
        Math.sin(this.cameraRotation.x) *
        Math.cos(this.cameraRotation.y);
      const offsetY = distance * Math.sin(this.cameraRotation.y);
      const offsetZ =
        distance *
        Math.cos(this.cameraRotation.x) *
        Math.cos(this.cameraRotation.y);

      // Set the camera position relative to the ship's position
      this.camera.position.set(
        this.model.position.x + offsetX,
        this.model.position.y + offsetY,
        this.model.position.z + offsetZ
      );

      // Ensure the camera remains upright using the global Y-axis
      this.camera.up.set(0, 1, 0); // Lock the camera's up vector to the world's Y-axis

      // Make the camera look at the ship's position
      this.camera.lookAt(this.model.position);
    } else {
      // Calculate the target position for the camera directly behind and above the ship
      const targetPosition = new THREE.Vector3(0, heightOffset, distance); // Offset in the ship's local space
      targetPosition.applyQuaternion(this.model.quaternion); // Rotate offset to match the ship's orientation
      targetPosition.add(this.model.position); // Add ship's position to compute world position

      // Interpolate the camera's position smoothly toward the target position
      this.camera.position.lerp(targetPosition, 1); // Adjust the interpolation factor (0.1 = smoother, 0.3 = faster)

      // Copy the ship's rotation
      const shipQuaternion = this.model.quaternion.clone();

      // Flip the camera's direction (rotate 180 degrees around the Y-axis)
      const flipQuaternion = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), // Y-axis
        Math.PI // 180 degrees
      );

      // Combine the ship's quaternion with the flip
      shipQuaternion.multiply(flipQuaternion);

      // Smoothly interpolate the camera's quaternion toward the target rotation
      this.camera.quaternion.slerp(
        shipQuaternion, // Target rotation
        0.1
      );
    }
  }
}
