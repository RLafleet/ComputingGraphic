import * as THREE from 'three';
import { TankType, TANK_HEIGHT, PLAYER_SPEED, TANK_ROTATION_SPEED, PLAYER_HEALTH, 
    SHOOT_COOLDOWN_PLAYER, BULLET_SPEED } from './TankTypes';
import { TankModel } from './TankModel';
import { TankVisuals } from './TankVisuals';

export class BaseTank {
    protected model: TankModel;
    protected speed: number = PLAYER_SPEED;
    protected rotationSpeed: number = TANK_ROTATION_SPEED;
    protected health: number = PLAYER_HEALTH;
    protected type: TankType;
    protected direction: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
    protected lastShootTime: number = 0;
    protected shootCooldown: number = SHOOT_COOLDOWN_PLAYER;
    protected isMoving: boolean = false;

    constructor(type: TankType, position: THREE.Vector3) {
        this.type = type;
        this.model = new TankModel(type, position);
        this.model.mesh.position.y = TANK_HEIGHT;
    }

    public moveForward(): void {
        this.model.mesh.translateZ(this.speed);
        this.isMoving = true;
        this.model.mesh.position.y = TANK_HEIGHT;
        this.updateDirection();
    }

    public moveBackward(): void {
        this.model.mesh.translateZ(-this.speed);
        this.isMoving = true;
        this.model.mesh.position.y = TANK_HEIGHT;
        this.updateDirection();
    }

    public rotateLeft(): void {
        this.model.mesh.rotateY(this.rotationSpeed);
        this.updateDirection();
    }

    public rotateRight(): void {
        this.model.mesh.rotateY(-this.rotationSpeed);
        this.updateDirection();
    }

    public stopMoving(): void {
        this.isMoving = false;
    }

    public updateDirection(): void {
        this.direction.set(
            Math.sin(this.model.mesh.rotation.y),
            0,
            Math.cos(this.model.mesh.rotation.y)
        );
    }

    public move(direction: THREE.Vector3): void {
        if (direction.length() > 0) {
            direction.normalize();
            const newDirection = direction.clone();
            const moveAmount = new THREE.Vector3()
                .copy(newDirection)
                .multiplyScalar(this.speed);
            this.model.mesh.position.add(moveAmount);
            const targetRotation = Math.atan2(newDirection.x, newDirection.z);
            const currentRotation = this.model.mesh.rotation.y;
            const rotationDelta = Math.atan2(Math.sin(targetRotation - currentRotation), Math.cos(targetRotation - currentRotation));
            if (Math.abs(rotationDelta) > 0.05) {
                this.model.mesh.rotation.y += rotationDelta * 0.1;
                this.updateDirection();
            }
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    public shoot(): THREE.Mesh | null {
        const currentTime = Date.now();
        if (currentTime - this.lastShootTime < this.shootCooldown) {
            return null;
        }
        this.lastShootTime = currentTime;
        const bulletGeometry = new THREE.SphereGeometry(0.15, 12, 12);
        const bulletMaterial = new THREE.MeshPhongMaterial({ 
            color: this.type === TankType.PLAYER ? 0xffff00 : 0xff0000,
            emissive: this.type === TankType.PLAYER ? 0xffff00 : 0xff0000,
            emissiveIntensity: 0.7
        });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        const bulletDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(this.model.turretPivot.quaternion);
        const tankWorldPosition = new THREE.Vector3();
        this.model.mesh.getWorldPosition(tankWorldPosition);
        bulletDirection.applyQuaternion(this.model.mesh.quaternion);
        bullet.position.copy(tankWorldPosition).add(
            new THREE.Vector3(0, 0.7, 0)
        ).add(bulletDirection);
        TankVisuals.createMuzzleFlash(bulletDirection, tankWorldPosition, this.model.mesh.parent!);
        bullet.userData = {
            direction: bulletDirection.normalize(),
            speed: BULLET_SPEED,
            owner: this.type
        };
        return bullet;
    }

    public takeDamage(amount: number): void {
        this.health -= amount;
    }

    public isDestroyed(): boolean {
        return this.health <= 0;
    }

    public getMesh(): THREE.Object3D {
        return this.model.mesh;
    }

    public getPosition(): THREE.Vector3 {
        return this.model.mesh.position;
    }

    public getDirection(): THREE.Vector3 {
        return this.direction;
    }

    public getType(): TankType {
        return this.type;
    }

    public getHealth(): number {
        return this.health;
    }

    protected constrainToGameField(fieldSize: number): void {
        const halfSize = fieldSize / 2;
        const margin = 1;
        if (this.model.mesh.position.x > halfSize - margin) {
            this.model.mesh.position.x = halfSize - margin;
        }
        if (this.model.mesh.position.x < -halfSize + margin) {
            this.model.mesh.position.x = -halfSize + margin;
        }
        if (this.model.mesh.position.z > halfSize - margin) {
            this.model.mesh.position.z = halfSize - margin;
        }
        if (this.model.mesh.position.z < -halfSize + margin) {
            this.model.mesh.position.z = -halfSize + margin;
        }
    }
    
    public isEnemy(): boolean {
        return this.type !== TankType.PLAYER;
    }
} 