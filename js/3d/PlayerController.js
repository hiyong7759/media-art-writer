/**
 * PlayerController - First-person camera controls with physics
 * Handles WASD movement, mouse look, jumping, and collision
 */

export class PlayerController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Position & movement
        this.position = new THREE.Vector3(0, 1.7, 0); // Eye height
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Look
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.mouseSensitivity = 0.002;

        // Physics
        this.moveSpeed = 5;
        this.sprintMultiplier = 1.8;
        this.jumpForce = 8;
        this.gravity = 20;
        this.groundY = 1.7;
        this.isGrounded = true;

        // Input state
        this.keys = {};
        this.isLocked = false;
        this.isSprinting = false;

        // Collision
        this.collisionRadius = 0.4;
        this.collisionObjects = [];

        this._setupEventListeners();
    }

    _setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.isSprinting = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.isSprinting = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isLocked) return;

            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= e.movementX * this.mouseSensitivity;
            this.euler.x -= e.movementY * this.mouseSensitivity;
            this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        });

        // Pointer lock
        this.domElement.addEventListener('click', () => {
            if (!this.isLocked) this.lock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.domElement;
        });
    }

    lock() {
        this.domElement.requestPointerLock();
    }

    unlock() {
        document.exitPointerLock();
    }

    setCollisionObjects(objects) {
        this.collisionObjects = objects;
    }

    _checkCollision(newPos) {
        for (const obj of this.collisionObjects) {
            if (!obj.userData || !obj.userData.collision) continue;

            const bounds = obj.userData.collision;
            const dx = newPos.x - bounds.center.x;
            const dz = newPos.z - bounds.center.z;

            // Simple AABB collision
            if (Math.abs(dx) < bounds.halfWidth + this.collisionRadius &&
                Math.abs(dz) < bounds.halfDepth + this.collisionRadius) {
                return true;
            }
        }
        return false;
    }

    update(deltaTime) {
        if (!this.isLocked) return;

        const speed = this.moveSpeed * (this.isSprinting ? this.sprintMultiplier : 1);

        // Calculate forward/right vectors
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        // Movement input
        this.direction.set(0, 0, 0);
        if (this.keys['KeyW']) this.direction.add(forward);
        if (this.keys['KeyS']) this.direction.sub(forward);
        if (this.keys['KeyD']) this.direction.add(right);
        if (this.keys['KeyA']) this.direction.sub(right);

        if (this.direction.lengthSq() > 0) {
            this.direction.normalize();
        }

        // Apply horizontal movement
        this.velocity.x = this.direction.x * speed;
        this.velocity.z = this.direction.z * speed;

        // Jump
        if (this.keys['Space'] && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Gravity
        if (!this.isGrounded) {
            this.velocity.y -= this.gravity * deltaTime;
        }

        // Apply movement with collision check
        const newPos = this.position.clone();
        newPos.x += this.velocity.x * deltaTime;
        newPos.z += this.velocity.z * deltaTime;
        newPos.y += this.velocity.y * deltaTime;

        // Check horizontal collision
        if (!this._checkCollision(newPos)) {
            this.position.x = newPos.x;
            this.position.z = newPos.z;
        }

        // Vertical
        this.position.y += this.velocity.y * deltaTime;

        // Ground check
        if (this.position.y <= this.groundY) {
            this.position.y = this.groundY;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Boundary limits (keep inside museum)
        const limit = 48;
        this.position.x = Math.max(-limit, Math.min(limit, this.position.x));
        this.position.z = Math.max(-limit, Math.min(limit, this.position.z));

        // Update camera
        this.camera.position.copy(this.position);
    }

    getPosition() {
        return this.position.clone();
    }

    getForwardDirection() {
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        return forward;
    }

    getYRotation() {
        return this.euler.y;
    }
}
