import * as THREE from 'three';
import { Tank, TankType, PlayerTank, EnemyTank, LightEnemyTank, MediumEnemyTank, HeavyEnemyTank } from './models/Tank';
import { Level, LevelLayout } from './models/Level';
import { BlockType, createBlock } from './models/terrain/Block';
import { UI } from './UI';
import { CollisionManager } from './managers/CollisionManager';
import { EffectsManager } from './managers/EffectsManager';
import { InputHandler } from './input/InputHandler';
import { LevelGenerator } from './level/LevelGenerator';
import { PowerUpManager } from './managers/PowerUpManager';
import { 
    MAX_ENEMY_TANKS, TOTAL_ENEMY_TANKS, PLAYER_LIVES, TANK_SPAWN_RATE, 
    ENEMY_ROTATION_RATE, 
    SCORE_TANK_DESTROYED, TANK_COLLISION_RADIUS, 
    PLAYER_FIRE_DELAY, MACHINE_GUN_FIRE_DELAY, HELMET_DURATION
} from './constants/GameConstants';

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private playerTank!: PlayerTank;
    private enemyTanks: Tank[] = [];
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
        this.playerTank = new PlayerTank(spawnPosition);
        this.scene.add(this.playerTank.getMesh());
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
        if (this.enemyTanks.length >= this.maxEnemyTanks || this.remainingEnemyTanks <= 0) {
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
        for (const enemy of this.enemyTanks) {
            if (spawnPosition.distanceTo(enemy.getPosition()) < TANK_COLLISION_RADIUS * 2) {
                console.log("Position too close to another tank, skipping spawn");
                return false;
            }
        }
        if (this.playerTank && spawnPosition.distanceTo(this.playerTank.getPosition()) < TANK_COLLISION_RADIUS * 6) {
            return false;
        }
        let enemyTank: EnemyTank; 
        const tankTypeVal = Math.random();
        if (tankTypeVal < 0.5) {
            enemyTank = new LightEnemyTank(spawnPosition);
        } else if (tankTypeVal < 0.8) {
            enemyTank = new MediumEnemyTank(spawnPosition);
        } else {
            enemyTank = new HeavyEnemyTank(spawnPosition);
        }
        this.scene.add(enemyTank.getMesh());
        this.enemyTanks.push(enemyTank);
        return true;
    }

    public update(): void {
        if (this.gameOver) return;
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; 
        this.lastUpdateTime = currentTime;
        if (this.playerTank) {
            this.powerUpManager.update(this.playerTank, currentTime);
        }
        if (this.playerTank instanceof PlayerTank) {
            (this.playerTank as PlayerTank).update(deltaTime);
        }
        this.processPlayerMovement();
        if (!this.powerUpManager.areEnemiesFrozen) {
            this.updateEnemyTanks(deltaTime);
        }
        this.updateBullets();
        if (Math.random() < TANK_SPAWN_RATE && this.enemyTanks.length < this.maxEnemyTanks) {
            this.spawnEnemyTank();
        }
        this.updateCamera();
        this.checkGameState();
    }

    private processPlayerMovement(): void {
        if (this.gameOver || !this.playerTank) return; 
        const currentKeys = this.inputHandler.getKeys();
        const oldPosition = this.playerTank.getPosition().clone();
        let moved = false; 
        if (currentKeys['w'] === true || currentKeys['ArrowUp'] === true) {
            this.playerTank.moveForward(); moved = true;
        }
        if (currentKeys['s'] === true || currentKeys['ArrowDown'] === true) {
            this.playerTank.moveBackward(); moved = true;
        }
        if (currentKeys['a'] === true || currentKeys['ArrowLeft'] === true) {
            this.playerTank.rotateLeft(); 
        }
        if (currentKeys['d'] === true || currentKeys['ArrowRight'] === true) {
            this.playerTank.rotateRight();
        }
        if (moved && this.playerTank && this.collisionManager.checkTankBlockCollision(this.playerTank, this.level)) {
            this.playerTank.getMesh().position.copy(oldPosition);
        }
        if (this.playerTank) {
            for (const enemy of this.enemyTanks) {
                if (enemy && this.collisionManager.checkSingleTankToTankCollision(this.playerTank, enemy)) {
                    this.playerTank.getMesh().position.copy(oldPosition); 
                    break; 
                }
            }
        }
        this.constrainTankToField();
        this.updateCamera();
    }

    public playerShoot(): void {
        if (this.gameOver || !this.playerTank) return;
        const currentTime = Date.now();
        const fireDelay = this.powerUpManager.isMachineGunActive ? MACHINE_GUN_FIRE_DELAY : PLAYER_FIRE_DELAY;
        if (currentTime - this.lastFireTime < fireDelay) {
            return;
        }
        const bullet = this.playerTank.shoot();
        if (bullet) {
            bullet.userData['isPlayerBullet'] = true;
            bullet.userData['owner'] = TankType.PLAYER;
            this.scene.add(bullet);
            this.bullets.push(bullet);
            this.lastFireTime = currentTime;
        }
    }

    private updateEnemyTanks(deltaTime: number): void {
        if (this.enemyTanks.length === 0 || this.powerUpManager.areEnemiesFrozen) return;

        for (let i = this.enemyTanks.length - 1; i >= 0; i--) {
            const tank = this.enemyTanks[i];
            if (!tank || tank.isDestroyed()) { 
                if (tank && tank.isDestroyed()){
                    this.scene.remove(tank.getMesh());
                    this.enemyTanks.splice(i,1);
                }
                continue;
            }
            
            const oldPosition = tank.getPosition().clone();
            let shotBullet: THREE.Mesh | null = null;

            if (tank instanceof EnemyTank) {
                shotBullet = (tank as EnemyTank).update(deltaTime); // Capture bullet
            }

            if (shotBullet) {
                if (shotBullet.userData) {
                    shotBullet.userData['isPlayerBullet'] = false; 
                } else {
                    shotBullet.userData = { isPlayerBullet: false }; 
                }
                this.scene.add(shotBullet);
                this.bullets.push(shotBullet);
            }
            
            const playerPos = this.playerTank ? this.playerTank.getPosition() : null;
            if (playerPos) {
                const toPlayer = new THREE.Vector3().subVectors(playerPos, oldPosition);
                const distanceToPlayer = toPlayer.length();
                const angleToPlayer = Math.atan2(toPlayer.x, toPlayer.z);
                if (Math.random() < ENEMY_ROTATION_RATE) { 
                    tank.getMesh().rotation.y = angleToPlayer;
                    tank.updateDirection();
                }
                if (distanceToPlayer > 15 && Math.random() < 0.8) tank.moveForward();
                else if (distanceToPlayer < 5 && Math.random() < 0.3) tank.moveBackward();
                else if (Math.random() < 0.6) tank.moveForward();
            } else { 
                 if (Math.random() < 0.1) tank.rotateLeft();
                 else if (Math.random() < 0.1) tank.rotateRight();
                 else if (Math.random() < 0.5) tank.moveForward();
            }
            let collisionReverted = false;
            if (this.collisionManager.checkTankBlockCollision(tank, this.level)) {
                tank.getMesh().position.copy(oldPosition);
                collisionReverted = true;
            }
            if (!collisionReverted && this.collisionManager.checkEnemyTankCollision(tank, this.enemyTanks, i)) {
                tank.getMesh().position.copy(oldPosition);
                collisionReverted = true;
            }
            if (!collisionReverted && this.playerTank && this.collisionManager.checkSingleTankToTankCollision(tank, this.playerTank)) {
                 tank.getMesh().position.copy(oldPosition);
            }
            this.constrainEnemyTankToField(tank);
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
            if (this.playerTank) { 
                const collisionResult = this.collisionManager.checkBulletCollisions(
                    bullet,
                    this.playerTank,
                    this.enemyTanks, 
                    this.level,
                    this.scene, 
                    this.powerUpManager.isPlayerInvulnerable
                );
                if (collisionResult.bulletShouldBeRemoved) {
                    this.scene.remove(bullet); 
                    removedByCollision = true;
                }
                if (collisionResult.playerHit.wasHit && this.playerTank) {
                    if (this.debug) console.log("Game: Player was hit, new health: ", collisionResult.playerHit.newHealth);
                }
                for (const enemyHit of collisionResult.enemiesProcessed) {
                    const enemyTank = this.enemyTanks.find((et, idx) => idx === enemyHit.indexInSourceArray && et === this.enemyTanks[enemyHit.indexInSourceArray]);
                    if (enemyTank && enemyHit.wasDestroyed) {
                        if (this.debug) {
                            console.log(`Game: Enemy tank ${enemyHit.indexInSourceArray} destroyed. Pos: ${enemyHit.positionIfDestroyed}, Type: ${enemyHit.typeIfDestroyed}`);
                        }
                        this.scene.remove(enemyTank.getMesh());
                        const currentEnemyTankIndex = this.enemyTanks.indexOf(enemyTank);
                        if (currentEnemyTankIndex !== -1) {
                            this.enemyTanks.splice(currentEnemyTankIndex, 1); 
                        }
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
        if (!this.playerTank) return;
        const playerPos = this.playerTank.getPosition();
        this.camera.position.set(
            playerPos.x,
            35, 
            playerPos.z + 25 
        );
        this.camera.lookAt(playerPos);
    }

    private checkGameState(): void {
        if (!this.playerTank) {
            if (!this.gameOver) {
                console.warn("checkGameState called with no playerTank and game not over.");
            }
            return;
        }
        if (this.playerTank.isDestroyed()) {
            this.playerLives--;
            this.ui.updateLives(this.playerLives);
            if (this.playerLives <= 0) {
                this.gameOver = true;
                this.ui.showGameOver(false);
                console.log("Game Over - Player destroyed!");
            } else {
                this.powerUpManager.clearPlayerShield();
                this.scene.remove(this.playerTank.getMesh());
                const { width, height } = this.level.getDimensions();
                const offsetX = -(width / 2) + 0.5;
                const offsetZ = -(height / 2) + 0.5;
                const spawnPosition = this.findSafeSpawnPosition(width, height, offsetX, offsetZ);
                if (spawnPosition) {
                    this.playerTank = new PlayerTank(spawnPosition);
                    this.scene.add(this.playerTank.getMesh());
                    this.powerUpManager.activatePlayerInvulnerability(HELMET_DURATION, this.playerTank);
                    console.log("Player respawned with invulnerability!");
                } else {
                    console.error("Failed to respawn player: no safe spawn position found.");
                    this.gameOver = true;
                    this.ui.showGameOver(false);
                }
            }
        }
        if (this.remainingEnemyTanks <= 0 && this.enemyTanks.length === 0) {
            this.gameOver = true;
            this.ui.showGameOver(true);
            console.log("Game Over - Player wins!");
        }
    }

    private constrainTankToField(): void {
        if (!this.playerTank) return;
        const position = this.playerTank.getMesh().position;
        const { width, height } = this.level.getDimensions();
        const offsetX = -(width / 2) + 0.5;
        const offsetZ = -(height / 2) + 0.5;
        const minX = offsetX + 1; 
        const maxX = offsetX + width - 2; 
        const minZ = offsetZ + 1;
        const maxZ = offsetZ + height - 2;
        if (position.x > maxX) {
            position.x = maxX;
            console.log(`X ограничение (правая стена): ${position.x.toFixed(2)}`);
        }
        if (position.x < minX) {
            position.x = minX;
            console.log(`X ограничение (левая стена): ${position.x.toFixed(2)}`);
        }
        if (position.z > maxZ) {
            position.z = maxZ;
            console.log(`Z ограничение (дальняя стена): ${position.z.toFixed(2)}`);
        }
        if (position.z < minZ) {
            position.z = minZ;
            console.log(`Z ограничение (ближняя стена): ${position.z.toFixed(2)}`);
        }
    }

    private constrainEnemyTankToField(tank: Tank): void {
        const position = tank.getMesh().position;
        const { width, height } = this.level.getDimensions();
        const offsetX = -(width / 2) + 0.5;
        const offsetZ = -(height / 2) + 0.5;
        const minX = offsetX + 1; 
        const maxX = offsetX + width - 2; 
        const minZ = offsetZ + 1;
        const maxZ = offsetZ + height - 2;
        if (position.x > maxX) position.x = maxX;
        if (position.x < minX) position.x = minX;
        if (position.z > maxZ) position.z = maxZ;
        if (position.z < minZ) position.z = minZ;
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
        const enemyCount = this.enemyTanks.length;
        for (const tank of this.enemyTanks) {
            if (tank) {
                this.scene.remove(tank.getMesh());
                this.effectsManager.createExplosionEffect(tank.getPosition()); 
            }
        }
        this.enemyTanks = [];
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
} 