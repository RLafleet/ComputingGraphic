import * as THREE from 'three';
import { TankType, TANK_HEIGHT, PLAYER_SPEED, TANK_ROTATION_SPEED, PLAYER_HEALTH, 
    SHOOT_COOLDOWN_PLAYER, BULLET_SPEED } from './TankTypes';
import { BulletFireData, TankState, TankStateUpdateListener } from './TankInterfaces';

export class BaseTank {
    private logicalPosition: THREE.Vector3;
    private logicalRotationY: number;
    public logicalTurretRotationY: number = 0;

    protected speed: number = PLAYER_SPEED;
    protected rotationSpeed: number = TANK_ROTATION_SPEED;
    protected health: number = PLAYER_HEALTH;
    protected type: TankType;
    protected direction: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
    protected lastShootTime: number = 0;
    protected shootCooldown: number = SHOOT_COOLDOWN_PLAYER;
    protected isMoving: boolean = false;

    private onStateUpdate: TankStateUpdateListener | null = null;

    constructor(type: TankType, position: THREE.Vector3) {
        this.type = type;
        this.logicalPosition = position.clone();
        this.logicalPosition.y = TANK_HEIGHT; 
        this.logicalRotationY = 0; 
        this.logicalTurretRotationY = 0;
        this.updateDirection(); 
    }

    public setOnStateUpdateListener(listener: TankStateUpdateListener): void {
        this.onStateUpdate = listener;
    }

    private notifyStateUpdate(): void {
        if (this.onStateUpdate) {
            this.onStateUpdate({
                position: this.logicalPosition.clone(),
                rotationY: this.logicalRotationY,
                turretRotationY: this.logicalTurretRotationY,
                tankType: this.type
            });
        }
    }

    public moveForward(): void {
        const moveX = Math.sin(this.logicalRotationY) * this.speed;
        const moveZ = Math.cos(this.logicalRotationY) * this.speed;
        this.logicalPosition.x += moveX;
        this.logicalPosition.z += moveZ;
        this.isMoving = true;
        this.notifyStateUpdate();
    }

    public moveBackward(): void {
        const moveX = Math.sin(this.logicalRotationY) * this.speed;
        const moveZ = Math.cos(this.logicalRotationY) * this.speed;
        this.logicalPosition.x -= moveX;
        this.logicalPosition.z -= moveZ;
        this.isMoving = true;
        this.notifyStateUpdate();
    }

    public rotateLeft(): void {
        this.logicalRotationY += this.rotationSpeed;
        this.updateDirection();
        this.notifyStateUpdate();
    }

    public rotateRight(): void {
        this.logicalRotationY -= this.rotationSpeed;
        this.updateDirection();
        this.notifyStateUpdate();
    }

    public stopMoving(): void {
        this.isMoving = false;
    }

    public updateDirection(): void {
        this.direction.set(
            Math.sin(this.logicalRotationY),
            0,
            Math.cos(this.logicalRotationY)
        );
    }

    public move(direction: THREE.Vector3): void {
        if (direction.lengthSq() > 0) { 
            const normalizedDirection = direction.clone().normalize();
            const moveAmount = normalizedDirection.clone().multiplyScalar(this.speed);
            this.logicalPosition.add(moveAmount);
            this.logicalPosition.y = TANK_HEIGHT; 
            const targetRotation = Math.atan2(normalizedDirection.x, normalizedDirection.z);
            const currentRotation = this.logicalRotationY;
            let rotationDelta = targetRotation - currentRotation;
            while (rotationDelta > Math.PI) rotationDelta -= 2 * Math.PI;
            while (rotationDelta < -Math.PI) rotationDelta += 2 * Math.PI;
            const rotationLerpFactor = 0.1; 
            if (Math.abs(rotationDelta) > 0.01) { 
                this.logicalRotationY += rotationDelta * rotationLerpFactor;
                this.logicalRotationY = Math.atan2(Math.sin(this.logicalRotationY), Math.cos(this.logicalRotationY));
            }
            this.updateDirection();
            this.isMoving = true;
            this.notifyStateUpdate();
        } else {
            if (this.isMoving) {
                this.isMoving = false;
            }
        }
    }

    public shoot(): BulletFireData | null {
        const currentTime = Date.now();
        if (currentTime - this.lastShootTime < this.shootCooldown) {
            return null;
        }
        this.lastShootTime = currentTime;

        const tankWorldPosition = this.logicalPosition.clone();

        const bodyQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.logicalRotationY);
        const turretLocalQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.logicalTurretRotationY);
        const worldTurretQuaternion = new THREE.Quaternion().multiplyQuaternions(bodyQuaternion, turretLocalQuaternion);

        const bulletLocalDirection = new THREE.Vector3(0, 0, 1); 
        const bulletWorldDirection = bulletLocalDirection.clone().applyQuaternion(worldTurretQuaternion).normalize();

        const turretOffset = 0.7;
        const barrelLength = 1.0;
        
        const muzzleOffsetFromTurretPivot = new THREE.Vector3(0, 0, barrelLength);
        const worldMuzzlePosition = muzzleOffsetFromTurretPivot.clone().applyQuaternion(worldTurretQuaternion).add(tankWorldPosition);
        worldMuzzlePosition.y = this.logicalPosition.y + turretOffset;

        return {
            initialPosition: worldMuzzlePosition,
            direction: bulletWorldDirection,
            speed: BULLET_SPEED,
            ownerType: this.type,
            muzzleWorldPosition: worldMuzzlePosition.clone(),
            muzzleWorldDirection: bulletWorldDirection.clone()
        };
    }

    public takeDamage(amount: number): void {
        this.health -= amount;
    }

    public isDestroyed(): boolean {
        return this.health <= 0;
    }

    public getPosition(): THREE.Vector3 {
        return this.logicalPosition.clone();
    }

    public setPosition(newPosition: THREE.Vector3): void {
        this.logicalPosition.copy(newPosition);
        this.logicalPosition.y = TANK_HEIGHT; 
        this.notifyStateUpdate();
    }

    public getRotationY(): number {
        return this.logicalRotationY;
    }

    public setRotationY(newRotationY: number): void {
        this.logicalRotationY = newRotationY;
        this.updateDirection();
        this.notifyStateUpdate();
    }
    
    public getTurretRotationY(): number {
        return this.logicalTurretRotationY;
    }

    public setTurretRotationY(newTurretRotationY: number): void {
        this.logicalTurretRotationY = newTurretRotationY;
        this.logicalTurretRotationY = Math.atan2(Math.sin(this.logicalTurretRotationY), Math.cos(this.logicalTurretRotationY));
        this.notifyStateUpdate();
    }

    public getDirection(): THREE.Vector3 {
        return this.direction.clone();
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
        let changed = false;
        if (this.logicalPosition.x > halfSize - margin) {
            this.logicalPosition.x = halfSize - margin;
            changed = true;
        }
        if (this.logicalPosition.x < -halfSize + margin) {
            this.logicalPosition.x = -halfSize + margin;
            changed = true;
        }
        if (this.logicalPosition.z > halfSize - margin) {
            this.logicalPosition.z = halfSize - margin;
            changed = true;
        }
        if (this.logicalPosition.z < -halfSize + margin) {
            this.logicalPosition.z = -halfSize + margin;
            changed = true;
        }
        if (changed) {
            this.notifyStateUpdate();
        }
    }
    
    public isEnemy(): boolean {
        return this.type !== TankType.PLAYER;
    }
} 