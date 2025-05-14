import * as THREE from 'three';
import { Level } from '../models/Level';
import { Tank, PlayerTank, TankType } from '../models/Tank';
import { BlockType } from '../models/terrain/Block';
import { EffectsManager } from './EffectsManager';
import { TANK_COLLISION_RADIUS, BULLET_PLAYER_HIT_RADIUS, BULLET_ENEMY_HIT_RADIUS, BULLET_DAMAGE, SCORE_TANK_DESTROYED, SCORE_BLOCK_DESTROYED } from '../constants/GameConstants';

export interface BulletCollisionResult {
    bulletShouldBeRemoved: boolean;
    playerHit: {
        wasHit: boolean;
        newHealth?: number; 
    };
    enemiesProcessed: Array<{
        indexInSourceArray: number; 
        newHealth: number;
        wasDestroyed: boolean;
        positionIfDestroyed?: THREE.Vector3;
        typeIfDestroyed?: TankType;
    }>;
    blockHit: {
        wasHit: boolean;
        isSteel: boolean;
        isDestructible: boolean;
        gridX?: number; 
        gridZ?: number;
        blockRemovedByCollisionManager?: boolean; 
        steelHealth?: number; 
        blockType?: BlockType;
        hitPosition?: THREE.Vector3;
    };
    scoreDelta: number; 
}

export class CollisionManager {
    private effectsManager: EffectsManager;
    private debug: boolean;
    
    constructor(effectsManager: EffectsManager, debug: boolean) {
        this.effectsManager = effectsManager;
        this.debug = debug;
    }

    public checkTankBlockCollision(tank: Tank, level: Level): boolean {
        const tankPosition = tank.getPosition();
        const tankRadius = 0.7; 
        const blockRadius = 0.5; 
        const { width, height } = level.getDimensions();
        const offsetX = -(width / 2) + 0.5; 
        const offsetZ = -(height / 2) + 0.5;
        const tankGridX = Math.floor(tankPosition.x - offsetX);
        const tankGridZ = Math.floor(tankPosition.z - offsetZ);
        for (let z = tankGridZ - 1; z <= tankGridZ + 1; z++) {
            for (let x = tankGridX - 1; x <= tankGridX + 1; x++) {
                if (x < 0 || x >= width || z < 0 || z >= height) continue;
                const blockMesh = level.getBlockAt(x, z);
                if (blockMesh && blockMesh.userData && blockMesh.userData['isPassableByTanks'] === false) {
                    const distance = tankPosition.distanceTo(blockMesh.position);
                    if (distance < tankRadius + blockRadius) {
                        if (this.debug) {
                            console.log(`Tank collision with non-passable block type ${blockMesh.userData['blockType']} at grid (${x},${z}), distance: ${distance.toFixed(2)}`);
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public checkSingleTankToTankCollision(tank1: Tank, tank2: Tank): boolean {
        if (!tank1 || !tank2) return false;
        const distance = tank1.getPosition().distanceTo(tank2.getPosition());
        if (distance < TANK_COLLISION_RADIUS) {
            if (this.debug) {
                console.log(`Tank-to-tank collision detected! Distance: ${distance.toFixed(2)}`);
            }
            return true;
        }
        return false;
    }

    public checkEnemyTankCollision(currentTank: Tank, enemyTanks: Tank[], currentIndex: number): boolean {
        for (let i = 0; i < enemyTanks.length; i++) {
            if (i === currentIndex) continue; 
            const otherTank = enemyTanks[i];
            if (!otherTank) continue;
            if (this.checkSingleTankToTankCollision(currentTank, otherTank)) {
                return true;
            }
        }
        return false;
    }

    public checkBulletCollisions(
        bullet: THREE.Mesh,
        playerTank: PlayerTank, 
        enemyTanks: Tank[], 
        level: Level,
        scene: THREE.Scene, 
        isPlayerInvulnerable: boolean,
    ): BulletCollisionResult {
        const bulletPosition = bullet.position.clone();
        const bulletData = bullet.userData as { owner: TankType, isPlayerBullet: boolean }; 
        let scoreDelta = 0;
        const result: BulletCollisionResult = {
            bulletShouldBeRemoved: false,
            playerHit: { wasHit: false },
            enemiesProcessed: [],
            blockHit: { wasHit: false, isSteel: false, isDestructible: false },
            scoreDelta: 0
        };
        if (!bulletData.isPlayerBullet) {
            if (playerTank && !playerTank.isDestroyed()) { 
                const distanceToPlayer = bulletPosition.distanceTo(playerTank.getPosition());
                if (distanceToPlayer < BULLET_PLAYER_HIT_RADIUS) {
                    result.bulletShouldBeRemoved = true;
                    this.effectsManager.createBulletExplosion(bulletPosition);
                    if (!isPlayerInvulnerable) {
                        playerTank.takeDamage(BULLET_DAMAGE);
                        result.playerHit = { wasHit: true, newHealth: playerTank.getHealth() };
                        if (this.debug) console.log("Player tank hit by enemy bullet! Health:", playerTank.getHealth());
                    } else {
                        if (this.debug) console.log("Player is invulnerable! Bullet had no effect.");
                    }
                    return result; 
                }
            }
        }
        else {
            for (let i = 0; i < enemyTanks.length; i++) {
                const enemyTank = enemyTanks[i];
                if (!enemyTank || enemyTank.isDestroyed()) continue;
                const distanceToEnemy = bulletPosition.distanceTo(enemyTank.getPosition());
                if (distanceToEnemy < BULLET_ENEMY_HIT_RADIUS) {
                    result.bulletShouldBeRemoved = true;
                    this.effectsManager.createBulletExplosion(bulletPosition);
                    enemyTank.takeDamage(BULLET_DAMAGE);
                    if (this.debug) console.log(`Enemy tank hit! Health: ${enemyTank.getHealth()}`);
                    const enemyProcessedInfo = {
                        indexInSourceArray: i,
                        newHealth: enemyTank.getHealth(),
                        wasDestroyed: enemyTank.isDestroyed(),
                        positionIfDestroyed: enemyTank.isDestroyed() ? enemyTank.getPosition().clone() : undefined,
                        typeIfDestroyed: enemyTank.isDestroyed() ? enemyTank.getType() : undefined
                    };
                    result.enemiesProcessed.push(enemyProcessedInfo);
                    if (enemyTank.isDestroyed()) {
                        this.effectsManager.createExplosionEffect(enemyTank.getPosition());
                        let tankScore = SCORE_TANK_DESTROYED;
                        if (enemyTank.getType() === TankType.ENEMY_MEDIUM) tankScore *= 2;
                        else if (enemyTank.getType() === TankType.ENEMY_HEAVY) tankScore *= 3;
                        scoreDelta += tankScore;
                    }
                    result.scoreDelta = scoreDelta;
                    return result; 
                }
            }
        }
        const { width, height } = level.getDimensions();
        const offsetX = -(width / 2) + 0.5;
        const offsetZ = -(height / 2) + 0.5;
        const gridX = Math.floor(bulletPosition.x - offsetX);
        const gridZ = Math.floor(bulletPosition.z - offsetZ);
        if (gridX < 0 || gridX >= width || gridZ < 0 || gridZ >= height) {
            return result; 
        }
        const block = level.getBlockAt(gridX, gridZ);
        if (block && block.userData) {
            const blockType = block.userData['blockType'] as BlockType;
            const isPassableByBullets = block.userData['isPassableByBullets'] === true;
            const isDestructible = block.userData['isDestructible'] === true;
            const blockHitPosition = block.position.clone();
            if (blockType === BlockType.STEEL) {
                result.bulletShouldBeRemoved = true;
                this.effectsManager.createBulletExplosion(bulletPosition);
                result.blockHit = {
                    wasHit: true, 
                    isSteel: true, 
                    isDestructible: true, 
                    gridX: gridX, gridZ: gridZ, 
                    blockType: blockType,
                    hitPosition: blockHitPosition
                };
                let currentHealth = block.userData['health'] as number | undefined;
                if (currentHealth === undefined) currentHealth = block.userData['maxHealth'] as number || 100; 
                currentHealth -= BULLET_DAMAGE;
                block.userData['health'] = currentHealth;
                result.blockHit.steelHealth = currentHealth;
                if (typeof block.userData['updateDamage'] === 'function') {
                    block.userData['updateDamage'](currentHealth, block.userData['maxHealth'] || 100);
                }
                if (currentHealth <= 0) {
                    scene.remove(block); 
                    this.effectsManager.createSteelDestructionEffect(blockHitPosition);
                    scoreDelta += SCORE_BLOCK_DESTROYED * 3; 
                    result.blockHit.blockRemovedByCollisionManager = true;
                } else {
                    if (this.debug) console.log(`Steel block damaged at x=${gridX}, z=${gridZ}, health: ${currentHealth}`);
                }
                result.scoreDelta += scoreDelta; 
                return result;
            }
            if (!isPassableByBullets) {
                 result.bulletShouldBeRemoved = true;
                 this.effectsManager.createBulletExplosion(bulletPosition);
                 result.blockHit = { 
                    wasHit: true, 
                    isSteel: false, 
                    isDestructible: isDestructible, 
                    gridX: gridX, gridZ: gridZ, 
                    blockType: blockType,
                    hitPosition: blockHitPosition
                };
                if (isDestructible) {
                    scene.remove(block);
                    this.effectsManager.createBlockDestructionEffect(blockHitPosition, blockType);
                    scoreDelta += SCORE_BLOCK_DESTROYED;
                    result.blockHit.blockRemovedByCollisionManager = true;
                } 
                result.scoreDelta += scoreDelta; 
                return result;
            }
        }
        result.scoreDelta = scoreDelta;
        return result;
    }
} 