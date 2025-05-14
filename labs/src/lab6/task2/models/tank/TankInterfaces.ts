import * as THREE from 'three';
import { TankType } from './TankTypes';

export interface BulletFireData {
    initialPosition: THREE.Vector3;
    direction: THREE.Vector3;
    speed: number;
    ownerType: TankType;
    muzzleWorldPosition: THREE.Vector3;
    muzzleWorldDirection: THREE.Vector3;
} 

export interface TankState {
    position: THREE.Vector3;
    rotationY: number; 
    turretRotationY: number; 
    tankType: TankType; 
}

export type TankStateUpdateListener = (newState: TankState) => void;

export class BaseTank {} 