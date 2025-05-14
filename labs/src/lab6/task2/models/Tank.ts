import * as THREE from 'three';
import { BaseTank } from './tank/BaseTank';
import { TankType as InternalTankType } from './tank/TankTypes';

export enum TankType {
    PLAYER = 'player',
    ENEMY_LIGHT = 'enemy_light',
    ENEMY_MEDIUM = 'enemy_medium',
    ENEMY_HEAVY = 'enemy_heavy'
}

export class Tank extends BaseTank {
    constructor(type: TankType, position: THREE.Vector3) {
        const internalType = convertType(type);
        super(internalType, position);
    }
}

function convertType(type: TankType): InternalTankType {
    switch(type) {
        case TankType.PLAYER:
            return InternalTankType.PLAYER;
        case TankType.ENEMY_LIGHT:
            return InternalTankType.ENEMY_LIGHT;
        case TankType.ENEMY_MEDIUM:
            return InternalTankType.ENEMY_MEDIUM;
        case TankType.ENEMY_HEAVY:
            return InternalTankType.ENEMY_HEAVY;
        default:
            return InternalTankType.PLAYER;
    }
}

export { PlayerTank } from './tank/PlayerTank';
export { EnemyTank, LightEnemyTank, MediumEnemyTank, HeavyEnemyTank } from './tank/EnemyTank'; 