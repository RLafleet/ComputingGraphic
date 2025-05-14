import * as THREE from 'three';
import { Tank, TankType, PlayerTank, EnemyTank, LightEnemyTank, MediumEnemyTank, HeavyEnemyTank, BaseTank } from './models/Tank';
import { TankModel } from './models/tank/TankModel';
import { Level, LevelLayout } from './models/Level';
import { BlockType, createBlock } from './models/terrain/Block';
import { UI } from './UI';
import { CollisionManager } from './managers/CollisionManager';
import { EffectsManager } from './managers/EffectsManager';
import { InputHandler } from './input/InputHandler';
import { LevelGenerator } from './level/LevelGenerator';
import { PowerUpManager } from './managers/PowerUpManager';
import { TankVisuals } from './models/tank/TankVisuals';
import { 
    MAX_ENEMY_TANKS, TOTAL_ENEMY_TANKS, PLAYER_LIVES, TANK_SPAWN_RATE, 
    ENEMY_ROTATION_RATE, 
    SCORE_TANK_DESTROYED, TANK_COLLISION_RADIUS, 
    PLAYER_FIRE_DELAY, MACHINE_GUN_FIRE_DELAY, HELMET_DURATION
} from './constants/GameConstants';
import { BulletFireData, TankState } from './models/tank/TankInterfaces';

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    
    private playerTankLogic!: PlayerTank;
    private playerTankVisual!: TankModel;

    private enemyTanksLogic: EnemyTank[] = [];
    private enemyTanksVisuals: Map<EnemyTank, TankModel> = new Map();

    private bullets: THREE.Mesh[] = [];
    private level!: Level;
    private maxEnemyTanks: number = MAX_ENEMY_TANKS;
    private remainingEnemyTanks: number = TOTAL_ENEMY_TANKS;
    private playerLives: number = PLAYER_LIVES;
    private score: number = 0;
    private gameOver: boolean = false;
    private ui!: UI;
    private debug: boolean = false; 
    private lastUpdateTime: number = Date.now();
    private lastFireTime: number = 0;     
    private effectsManager!: EffectsManager;
    private collisionManager!: CollisionManager;
    private inputHandler!: InputHandler;
    private powerUpManager!: PowerUpManager;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.scene = scene;
        this.camera = camera;
        this.debug = false;
        this.effectsManager = new EffectsManager(this.scene);
        this.collisionManager = new CollisionManager(this.effectsManager, this.debug);
        this.inputHandler = new InputHandler(this);
        console.log("Game constructor called - initializing game...");
        this.setupGame();
        if (this.debug) {
            console.log("Game initialized. Press WASD or Arrow keys to move, Space to shoot.");
        }
    }

    private setupGame(): void {
        this.ui = new UI();
        this.powerUpManager = new PowerUpManager(this.scene, this.ui, this.effectsManager, this, this.debug);
        this.ui.updateLives(this.playerLives);
        this.ui.updateTankCount(this.remainingEnemyTanks);
        this.ui.updateScore(this.score);
        const layout: LevelLayout = LevelGenerator.createRandomLevel();
        this.level = new Level(this.scene, layout);
        if (this.scene.fog) {
            this.scene.fog = null;
        }
    
        const { width, height } = this.level.getDimensions();
        console.log(`Размеры уровня: ${width}x${height}`);
        const offsetX = -(width / 2) + 0.5;
        const offsetZ = -(height / 2) + 0.5;
        const spawnPosition = this.findSafeSpawnPosition(width, height, offsetX, offsetZ);
        console.log(`Танк игрока создан на позиции: ${spawnPosition.x}, ${spawnPosition.z}`);
        this.playerTankLogic = new PlayerTank(spawnPosition);
        this.playerTankVisual = this.setupTank(this.playerTankLogic, spawnPosition);
        this.updateCamera();
        this.spawnInitialEnemies();
        this.lastUpdateTime = Date.now();
    }
    private spawnInitialEnemies(): void {
        for (let i = 0; i < 3; i++) {
            if (!this.spawnEnemyTank()) {
                console.log("Failed to spawn initial enemy tank, will try later");
            }
        }
    }
    private spawnEnemyTank(): boolean {
        if (this.enemyTanksLogic.length >= this.maxEnemyTanks || this.remainingEnemyTanks <= 0) {
            return false;
        }
        
        if (!this.level) {
            console.warn("spawnEnemyTank: Level not initialized");
            return false;
        }
        const { width, height } = this.level.getDimensions();
        const offsetX = -(width / 2) + 0.5;
        const offsetZ = -(height / 2) + 0.5;
        const possibleSpawnPoints: THREE.Vector3[] = [];
        const maxAttempts = 20;
        for (let i = 0; i < maxAttempts; i++) {
            const randomX = Math.floor(Math.random() * (width - 4)) + 2;
            const randomZ = Math.floor(Math.random() * (height / 3)) + 2;
            
            const block = this.level.getBlockAt(randomX, randomZ);
            const blockType = block?.userData?.['blockType'];
            if (blockType === BlockType.GROUND || blockType === BlockType.ICE) {
                const worldPosition = new THREE.Vector3(
                    offsetX + randomX,
                    0,
                    offsetZ + randomZ
                );
                possibleSpawnPoints.push(worldPosition);
            }
        }
        if (possibleSpawnPoints.length === 0) {
            console.log("Не удалось найти подходящие точки для появления врага");
            return false;
        }
        const spawnPosition = possibleSpawnPoints[Math.floor(Math.random() * possibleSpawnPoints.length)];
        if (!spawnPosition) return false;
        console.log(`Generating enemy at position: x=${spawnPosition.x.toFixed(2)}, z=${spawnPosition.z.toFixed(2)}`);
        for (const enemyLogic of this.enemyTanksLogic) {
            if (spawnPosition.distanceTo(enemyLogic.getPosition()) < TANK_COLLISION_RADIUS * 2) {
                console.log("Position too close to another tank, skipping spawn");
                return false;
            }
        }
        if (this.playerTankLogic && spawnPosition.distanceTo(this.playerTankLogic.getPosition()) < TANK_COLLISION_RADIUS * 6) {
            return false;
        }
        let newEnemyLogic: EnemyTank; 
        const tankTypeVal = Math.random();
        if (tankTypeVal < 0.5) {
            newEnemyLogic = new LightEnemyTank(spawnPosition);
        } else if (tankTypeVal < 0.8) {
            newEnemyLogic = new MediumEnemyTank(spawnPosition);
        } else {
            newEnemyLogic = new HeavyEnemyTank(spawnPosition);
        }
        const newEnemyVisual = this.setupTank(newEnemyLogic, spawnPosition);
        this.enemyTanksLogic.push(newEnemyLogic);
        this.enemyTanksVisuals.set(newEnemyLogic, newEnemyVisual);
        return true;
    }

    public update(): void {
        if (this.gameOver) return;
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; 
        this.lastUpdateTime = currentTime;
        if (this.playerTankLogic) {
            this.powerUpManager.update(this.playerTankLogic, currentTime);
        }
        if (this.playerTankLogic instanceof PlayerTank) {
            (this.playerTankLogic as PlayerTank).update(deltaTime);
        }
        this.processPlayerMovement();
        if (!this.powerUpManager.areEnemiesFrozen) {
            this.updateEnemyTanks(deltaTime);
        }
        this.updateBullets();
        if (Math.random() < TANK_SPAWN_RATE && this.enemyTanksLogic.length < this.maxEnemyTanks) {
            this.spawnEnemyTank();
        }
        this.updateCamera();
        this.checkGameState();
    }

    private processPlayerMovement(): void {
        if (this.gameOver || !this.playerTankLogic) return; 
        const currentKeys = this.inputHandler.getKeys();
        const oldPosition = this.playerTankLogic.getPosition().clone();
        let moved = false; 
        if (currentKeys['w'] === true || currentKeys['ArrowUp'] === true) {
            this.playerTankLogic.moveForward(); moved = true;
        }
        if (currentKeys['s'] === true || currentKeys['ArrowDown'] === true) {
            this.playerTankLogic.moveBackward(); moved = true;
        }
        if (currentKeys['a'] === true || currentKeys['ArrowLeft'] === true) {
            this.playerTankLogic.rotateLeft(); 
        }
        if (currentKeys['d'] === true || currentKeys['ArrowRight'] === true) {
            this.playerTankLogic.rotateRight();
        }

        if (moved && this.playerTankLogic && this.collisionManager.checkTankBlockCollision(this.playerTankLogic, this.level)) {
            this.playerTankLogic.setPosition(oldPosition);
        }
        if (this.playerTankLogic) {
            for (const enemyLogic of this.enemyTanksLogic) {
                if (enemyLogic && this.collisionManager.checkSingleTankToTankCollision(this.playerTankLogic, enemyLogic)) {
                    this.playerTankLogic.setPosition(oldPosition); 
                    break; 
                }
            }
        }
        this.constrainTankToField();
        this.updateCamera();
    }

    public playerShoot(): void {
        if (this.gameOver || !this.playerTankLogic) return;
        const currentTime = Date.now();
        const fireDelay = this.powerUpManager.isMachineGunActive ? MACHINE_GUN_FIRE_DELAY : PLAYER_FIRE_DELAY;
        if (currentTime - this.lastFireTime < fireDelay) {
            return;
        }
        const bulletData = this.playerTankLogic.shoot();
        if (bulletData) {
            this.handleBulletFired(bulletData);
            this.lastFireTime = currentTime;
        }
    }

    private handleBulletFired(bulletData: BulletFireData): void {
        const bulletGeometry = new THREE.SphereGeometry(0.15, 12, 12);
        const bulletMaterial = new THREE.MeshPhongMaterial({
            color: bulletData.ownerType === TankType.PLAYER ? 0xffff00 : 0xff0000,
            emissive: bulletData.ownerType === TankType.PLAYER ? 0xffff00 : 0xff0000,
            emissiveIntensity: 0.7
        });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

        bulletMesh.position.copy(bulletData.initialPosition);
        bulletMesh.userData = {
            direction: bulletData.direction,
            speed: bulletData.speed,
            owner: bulletData.ownerType, 
            isPlayerBullet: bulletData.ownerType === TankType.PLAYER
        };

        this.scene.add(bulletMesh);
        this.bullets.push(bulletMesh);

        TankVisuals.createMuzzleFlash(bulletData.muzzleWorldPosition, bulletData.muzzleWorldDirection, this.scene);
    }

    private updateEnemyTanks(deltaTime: number): void {
        if (this.enemyTanksLogic.length === 0 || this.powerUpManager.areEnemiesFrozen) return;

        for (let i = this.enemyTanksLogic.length - 1; i >= 0; i--) {
            const tankLogic = this.enemyTanksLogic[i];
            const tankVisual = this.enemyTanksVisuals.get(tankLogic);

            if (!tankLogic || !tankVisual || tankLogic.isDestroyed()) { 
                if (tankLogic && tankLogic.isDestroyed()){
                    if(tankVisual) this.scene.remove(tankVisual.mesh);
                    this.enemyTanksLogic.splice(i,1);
                    this.enemyTanksVisuals.delete(tankLogic);
                }
                continue;
            }
            
            const oldPosition = tankLogic.getPosition().clone();
            let shotBulletData: BulletFireData | null = null;

            if (tankLogic instanceof EnemyTank) {
                shotBulletData = tankLogic.update(deltaTime); 
            }

            if (shotBulletData) {
                this.handleBulletFired(shotBulletData);
            }
            
            const playerPos = this.playerTankLogic ? this.playerTankLogic.getPosition() : null;
            if (playerPos) {
                const toPlayer = new THREE.Vector3().subVectors(playerPos, oldPosition);
                const distanceToPlayer = toPlayer.length();
                const angleToPlayerBody = Math.atan2(toPlayer.x, toPlayer.z);
                
                const worldAngleToPlayerForTurret = Math.atan2(toPlayer.x, toPlayer.z);
                let localTurretAngle = worldAngleToPlayerForTurret - tankLogic.getRotationY();
                while (localTurretAngle > Math.PI) localTurretAngle -= 2 * Math.PI;
                while (localTurretAngle < -Math.PI) localTurretAngle += 2 * Math.PI;
                tankLogic.setTurretRotationY(localTurretAngle);

                if (Math.random() < ENEMY_ROTATION_RATE) { 
                    tankLogic.setRotationY(angleToPlayerBody);
                }
                if (distanceToPlayer > 15 && Math.random() < 0.8) tankLogic.moveForward();
                else if (distanceToPlayer < 5 && Math.random() < 0.3) tankLogic.moveBackward();
                else if (Math.random() < 0.6) tankLogic.moveForward();
            } else { 
                 if (Math.random() < 0.1) tankLogic.rotateLeft();
                 else if (Math.random() < 0.1) tankLogic.rotateRight();
                 else if (Math.random() < 0.5) tankLogic.moveForward();
            }
            let collisionReverted = false;
            if (this.collisionManager.checkTankBlockCollision(tankLogic, this.level)) {
                tankLogic.setPosition(oldPosition);
                collisionReverted = true;
            }
            if (!collisionReverted && this.collisionManager.checkEnemyTankCollision(tankLogic, this.enemyTanksLogic, i)) {
                tankLogic.setPosition(oldPosition);
                collisionReverted = true;
            }
            if (!collisionReverted && this.playerTankLogic && this.collisionManager.checkSingleTankToTankCollision(tankLogic, this.playerTankLogic)) {
                 tankLogic.setPosition(oldPosition);
            }
            if (tankLogic) {
                this.constrainEnemyTankToField(tankLogic as BaseTank); 
            }
        }
    }

    private updateBullets(): void {
        if (this.bullets.length === 0) return;
        const bulletsProcessedThisFrame: THREE.Mesh[] = [];
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet) continue; 
            const bulletData = bullet.userData as { direction: THREE.Vector3, speed: number, owner: TankType, isPlayerBullet: boolean };
            if (bulletData && bulletData.direction && typeof bulletData.speed === 'number') {
                const moveAmount = bulletData.direction.clone().multiplyScalar(bulletData.speed);
                bullet.position.add(moveAmount);
            } else {
                console.warn("Bullet missing data or invalid speed, removing:", bullet);
                this.scene.remove(bullet);
                continue; 
            }
            let removedByCollision = false;
            if (this.playerTankLogic) { 
                const collisionResult = this.collisionManager.checkBulletCollisions(
                    bullet,
                    this.playerTankLogic,
                    this.enemyTanksLogic, 
                    this.level,
                    this.scene, 
                    this.powerUpManager.isPlayerInvulnerable
                );
                if (collisionResult.bulletShouldBeRemoved) {
                    this.scene.remove(bullet); 
                    removedByCollision = true;
                }
                if (collisionResult.playerHit.wasHit && this.playerTankLogic) {
                    if (this.debug) console.log("Game: Player was hit, new health: ", collisionResult.playerHit.newHealth);
                }
                for (const enemyHit of collisionResult.enemiesProcessed) {
                    const enemyTankLogic = this.enemyTanksLogic[enemyHit.indexInSourceArray]; 
                    
                    if (enemyTankLogic && enemyHit.wasDestroyed) {
                        if (this.debug) {
                            console.log(`Game: Enemy tank ${enemyHit.indexInSourceArray} destroyed. Pos: ${enemyHit.positionIfDestroyed}, Type: ${enemyHit.typeIfDestroyed}`);
                        }
                        const enemyTankVisual = this.enemyTanksVisuals.get(enemyTankLogic);
                        if(enemyTankVisual) this.scene.remove(enemyTankVisual.mesh);
                        
                        this.enemyTanksLogic.splice(enemyHit.indexInSourceArray, 1); 
                        this.enemyTanksVisuals.delete(enemyTankLogic);
                        
                        this.remainingEnemyTanks--;
                        if (enemyHit.positionIfDestroyed) {
                            this.powerUpManager.spawnPowerUp(enemyHit.positionIfDestroyed);
                        }
                    }
                }
                if (collisionResult.scoreDelta > 0) {
                    this.score += collisionResult.scoreDelta;
                    this.ui.updateScore(this.score);
                }
            } else if (!bulletData.isPlayerBullet) {
            }
            if (removedByCollision) {
            } else {
                const bulletPos = bullet.position;
                const { width, height } = this.level.getDimensions();
                const mapBoundary = 10; 
                const minX = -(width / 2) - mapBoundary;
                const maxX = (width / 2) + mapBoundary;
                const minZ = -(height / 2) - mapBoundary;
                const maxZ = (height / 2) + mapBoundary;
                if (bulletPos.x < minX || bulletPos.x > maxX || bulletPos.z < minZ || bulletPos.z > maxZ) {
                    if (this.debug) console.log(`Bullet removed by Game: outside map bounds at ${bulletPos.x.toFixed(2)}, ${bulletPos.z.toFixed(2)}`);
                    this.scene.remove(bullet);
                } else {
                    bulletsProcessedThisFrame.push(bullet); 
                }
            }
        }
        this.bullets = bulletsProcessedThisFrame; 
        this.ui.updateTankCount(this.remainingEnemyTanks); 
    }

    private updateCamera(): void {
        if (!this.playerTankLogic) return;
        const playerPos = this.playerTankLogic.getPosition();
        this.camera.position.set(
            playerPos.x,
            35, 
            playerPos.z + 25 
        );
        this.camera.lookAt(playerPos);
    }

    private checkGameState(): void {
        if (!this.playerTankLogic) {
            if (!this.gameOver) {
                console.warn("checkGameState called with no playerTank and game not over.");
            }
            return;
        }
        if (this.playerTankLogic.isDestroyed()) {
            this.playerLives--;
            this.ui.updateLives(this.playerLives);
            if (this.playerLives <= 0) {
                this.gameOver = true;
                this.ui.showGameOver(false);
                console.log("Game Over - Player destroyed!");
            } else {
                this.powerUpManager.clearPlayerShield();
                if(this.playerTankVisual) this.scene.remove(this.playerTankVisual.mesh);
                const { width, height } = this.level.getDimensions();
                const offsetX = -(width / 2) + 0.5;
                const offsetZ = -(height / 2) + 0.5;
                const spawnPosition = this.findSafeSpawnPosition(width, height, offsetX, offsetZ);
                if (spawnPosition) {
                    this.playerTankLogic = new PlayerTank(spawnPosition);
                    this.playerTankVisual = this.setupTank(this.playerTankLogic, spawnPosition);
                    this.powerUpManager.activatePlayerInvulnerability(HELMET_DURATION, this.playerTankLogic);
                    console.log("Player respawned with invulnerability!");
                } else {
                    console.error("Failed to respawn player: no safe spawn position found.");
                    this.gameOver = true;
                    this.ui.showGameOver(false);
                }
            }
        }
        if (this.remainingEnemyTanks <= 0 && this.enemyTanksLogic.length === 0) {
            this.gameOver = true;
            this.ui.showGameOver(true);
            console.log("Game Over - Player wins!");
        }
    }

    private constrainTankToField(): void {
        if (!this.playerTankLogic) return;
        const currentPosition = this.playerTankLogic.getPosition();
        let constrainedPosition = currentPosition.clone();
        const { width, height } = this.level.getDimensions();
        const offsetX = -(width / 2) + 0.5;
        const offsetZ = -(height / 2) + 0.5;
        const minX = offsetX + 1; 
        const maxX = offsetX + width - 2; 
        const minZ = offsetZ + 1;
        const maxZ = offsetZ + height - 2;

        let changed = false;
        if (constrainedPosition.x > maxX) {
            constrainedPosition.x = maxX;
            changed = true;
            console.log(`X ограничение (правая стена): ${constrainedPosition.x.toFixed(2)}`);
        }
        if (constrainedPosition.x < minX) {
            constrainedPosition.x = minX;
            changed = true;
            console.log(`X ограничение (левая стена): ${constrainedPosition.x.toFixed(2)}`);
        }
        if (constrainedPosition.z > maxZ) {
            constrainedPosition.z = maxZ;
            changed = true;
            console.log(`Z ограничение (дальняя стена): ${constrainedPosition.z.toFixed(2)}`);
        }
        if (constrainedPosition.z < minZ) {
            constrainedPosition.z = minZ;
            changed = true;
            console.log(`Z ограничение (ближняя стена): ${constrainedPosition.z.toFixed(2)}`);
        }
        if(changed) {
            this.playerTankLogic.setPosition(constrainedPosition);
        }
    }

    private constrainEnemyTankToField(tank: BaseTank): void {
        const currentPosition = tank.getPosition();
        let constrainedPosition = currentPosition.clone();
        const { width, height } = this.level.getDimensions();
        const offsetX = -(width / 2) + 0.5;
        const offsetZ = -(height / 2) + 0.5;
        const minX = offsetX + 1; 
        const maxX = offsetX + width - 2; 
        const minZ = offsetZ + 1;
        const maxZ = offsetZ + height - 2;

        let changed = false;
        if (constrainedPosition.x > maxX) { constrainedPosition.x = maxX; changed = true; }
        if (constrainedPosition.x < minX) { constrainedPosition.x = minX; changed = true; }
        if (constrainedPosition.z > maxZ) { constrainedPosition.z = maxZ; changed = true; }
        if (constrainedPosition.z < minZ) { constrainedPosition.z = minZ; changed = true; }

        if(changed) {
            tank.setPosition(constrainedPosition);
        }
    }

    private findSafeSpawnPosition(width: number, height: number, offsetX: number, offsetZ: number): THREE.Vector3 {
        return new THREE.Vector3(
            offsetX + Math.floor(width / 2), 
            0,
            offsetZ + height - 7 
        );
    }

    public increasePlayerLives(amount: number): void {
        this.playerLives += amount;
        this.ui.updateLives(this.playerLives);
    }

    public getPlayerLives(): number {
        return this.playerLives;
    }

    public destroyAllEnemies(): void {
        const enemyCount = this.enemyTanksLogic.length;
        for (const tankLogic of this.enemyTanksLogic) {
            if (tankLogic) {
                const tankVisual = this.enemyTanksVisuals.get(tankLogic);
                if(tankVisual) this.scene.remove(tankVisual.mesh);
                this.effectsManager.createExplosionEffect(tankLogic.getPosition()); 
            }
        }
        this.enemyTanksLogic = [];
        this.enemyTanksVisuals.clear();
        this.remainingEnemyTanks = Math.max(0, this.remainingEnemyTanks - enemyCount);
        this.ui.updateTankCount(this.remainingEnemyTanks);
        this.score += enemyCount * SCORE_TANK_DESTROYED;
        this.ui.updateScore(this.score);
    }

    public repairBaseProtection(): void {
        if (!this.level) {
            console.warn("RepairBaseProtection: Level not initialized");
            return;
        }
        const { width, height } = this.level.getDimensions();
        const hqX = Math.floor(width / 2);
        const hqY = height - 5; 
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const blockX = hqX + dx;
                const blockY = hqY + dy;
                
                if (blockX >= 0 && blockX < width && blockY >= 0 && blockY < height) {
                    const existingBlock = this.level.getBlockAt(blockX, blockY);
                    
                    if (existingBlock) {
                        const blockType = existingBlock.userData?.['blockType'];
                        if (blockType === BlockType.BRICK || blockType === BlockType.STEEL) {
                            continue; 
                        }
                        this.scene.remove(existingBlock);
                        this.level.clearBlockData(blockX, blockY); 
                    }
                    
                    const offsetX = -(width / 2) + 0.5;
                    const offsetZ = -(height / 2) + 0.5;
                    const blockPosition = new THREE.Vector3(
                        offsetX + blockX,
                        0,
                        offsetZ + blockY
                    );
                    
                    const newBrickBlock = createBlock(BlockType.BRICK, blockPosition);
                    this.scene.add(newBrickBlock);
                    this.level.setBlockAt(blockX, blockY, newBrickBlock, BlockType.BRICK);
                }
            }
        }
    }

    private setupTank(tankLogic: BaseTank, initialPosition?: THREE.Vector3, initialRotationY?: number, initialTurretRotationY?: number): TankModel {
        const pos = initialPosition || tankLogic.getPosition();
        const rotY = initialRotationY || tankLogic.getRotationY();
        const turretRotY = initialTurretRotationY || tankLogic.getTurretRotationY();

        const tankVisual = new TankModel(tankLogic.getType(), pos);
        tankVisual.updateTransform(pos, rotY);
        tankVisual.updateTurretRotation(turretRotY);

        tankLogic.setOnStateUpdateListener((newState: TankState) => {
            tankVisual.updateTransform(newState.position, newState.rotationY);
            tankVisual.updateTurretRotation(newState.turretRotationY);
        });
        this.scene.add(tankVisual.mesh);
        return tankVisual;
    }
} 