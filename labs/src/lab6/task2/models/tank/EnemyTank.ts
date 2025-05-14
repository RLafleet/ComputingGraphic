import * as THREE from 'three';
import { BaseTank } from './BaseTank';
import { TankType, ENEMY_SPEED_LIGHT, ENEMY_SPEED_MEDIUM, ENEMY_SPEED_HEAVY,
    ENEMY_HEALTH_LIGHT, ENEMY_HEALTH_MEDIUM, ENEMY_HEALTH_HEAVY,
    SHOOT_COOLDOWN_LIGHT, SHOOT_COOLDOWN_MEDIUM, SHOOT_COOLDOWN_HEAVY } from './TankTypes';
import { BulletFireData } from './TankInterfaces';

export abstract class EnemyTank extends BaseTank {
    protected moveTimer: number = 0;
    protected moveInterval: number = 2000;
    protected shootTimer: number = 0;
    protected shootInterval: number = 3000;
    
    constructor(type: TankType, position: THREE.Vector3) {
        super(type, position);
        this.moveTimer = Math.random() * this.moveInterval;
        this.shootTimer = Math.random() * this.shootInterval;
    }
    
    // не логично THREE.Mesh
    public update(deltaTime: number): BulletFireData | null {
        let shotBulletData: BulletFireData | null = null;
        this.moveTimer += deltaTime * 1000;
        this.shootTimer += deltaTime * 1000;
        if (this.moveTimer > this.moveInterval) {
            this.moveTimer = 0;
            this.chooseRandomDirection();
        }
        if (this.shootTimer > this.shootInterval) {
            this.shootTimer = 0;
            shotBulletData = this.attemptShoot();
        }
        return shotBulletData;
    }
    
    // private вместо protected
    private chooseRandomDirection(): void {
        const randomValue = Math.random();
        if (randomValue < 0.25) {
            this.moveForward();
        } else if (randomValue < 0.5) {
            this.moveBackward();
        } else if (randomValue < 0.75) {
            this.rotateLeft();
        } else {
            this.rotateRight();
        }
    }
    private attemptShoot(): BulletFireData | null {
        return this.shoot();
    }
}

export class LightEnemyTank extends EnemyTank {
    constructor(position: THREE.Vector3) {
        super(TankType.ENEMY_LIGHT, position);
        this.setupTankTypeParameters();
    }
    protected setupTankTypeParameters(): void {
        this.speed = ENEMY_SPEED_LIGHT;
        this.health = ENEMY_HEALTH_LIGHT;
        this.shootCooldown = SHOOT_COOLDOWN_LIGHT;
        this.moveInterval = 1500;
        this.shootInterval = 2000;
    }
}

export class MediumEnemyTank extends EnemyTank {
    constructor(position: THREE.Vector3) {
        super(TankType.ENEMY_MEDIUM, position);
        this.setupTankTypeParameters();
    }
    protected setupTankTypeParameters(): void {
        this.speed = ENEMY_SPEED_MEDIUM;
        this.health = ENEMY_HEALTH_MEDIUM;
        this.shootCooldown = SHOOT_COOLDOWN_MEDIUM;
        this.moveInterval = 2000;
        this.shootInterval = 2500;
    }
}

export class HeavyEnemyTank extends EnemyTank {
    constructor(position: THREE.Vector3) {
        super(TankType.ENEMY_HEAVY, position);
        this.setupTankTypeParameters();
    }
    protected setupTankTypeParameters(): void {
        this.speed = ENEMY_SPEED_HEAVY;
        this.health = ENEMY_HEALTH_HEAVY;
        this.shootCooldown = SHOOT_COOLDOWN_HEAVY;
        this.moveInterval = 3000;
        this.shootInterval = 3500;
    }
}