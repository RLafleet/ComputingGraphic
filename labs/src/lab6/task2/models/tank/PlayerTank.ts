import * as THREE from 'three';
import { TankType } from './TankTypes';
import { BaseTank } from './BaseTank';
import { PLAYER_FIRE_DELAY, MACHINE_GUN_FIRE_DELAY, MACHINE_GUN_DURATION } from '../../constants/GameConstants';
import { BulletFireData } from './TankInterfaces';

export class PlayerTank extends BaseTank {
    private isMachineGunActive: boolean = false;
    private machineGunEndTime: number = 0;
    
    constructor(position: THREE.Vector3) {
        super(TankType.PLAYER, position);
    }

    // не логично THREE.Mesh
    public override shoot(): BulletFireData | null {
        const currentTime = Date.now();
        const fireDelay = this.isMachineGunActive ? MACHINE_GUN_FIRE_DELAY : PLAYER_FIRE_DELAY;
        if (currentTime - this.lastShootTime < fireDelay) {
            return null; 
        }
        return super.shoot();
    }

    public activateMachineGun(duration: number = MACHINE_GUN_DURATION): void {
        this.isMachineGunActive = true;
        this.machineGunEndTime = Date.now() + duration;
    }

    public update(deltaTime: number): void {
        const currentTime = Date.now();
        if (this.isMachineGunActive && currentTime > this.machineGunEndTime) {
            this.isMachineGunActive = false;
        }
    }

    public isMachineGunBoostActive(): boolean {
        return this.isMachineGunActive;
    }
} 