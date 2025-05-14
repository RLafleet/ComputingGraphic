import * as THREE from 'three';
import { PowerUp, PowerUpType } from '../PowerUp';
import { PlayerTank } from '../models/Tank';
import { UI } from '../UI';
import { EffectsManager } from './EffectsManager';
import { Game } from '../Game'; 
import { HELMET_DURATION, CLOCK_DURATION, MACHINE_GUN_DURATION, POWERUP_SPAWN_CHANCE, POWERUP_DURATION } from '../constants/GameConstants'; 

export class PowerUpManager {
    private scene: THREE.Scene;
    private ui: UI;
    private effectsManager: EffectsManager;
    private game: Game;
    private debug: boolean;
    private powerUps: PowerUp[] = [];
    public isPlayerInvulnerable: boolean = false;
    public invulnerableEndTime: number = 0;
    public isMachineGunActive: boolean = false;
    public machineGunEndTime: number = 0;
    public areEnemiesFrozen: boolean = false;
    public frozenEndTime: number = 0;
    private playerShield?: THREE.Mesh;

    constructor(scene: THREE.Scene, ui: UI, effectsManager: EffectsManager, game: Game, debug: boolean) {
        this.scene = scene;
        this.ui = ui;
        this.effectsManager = effectsManager;
        this.game = game; 
        this.debug = debug;
    }

    public spawnPowerUp(position: THREE.Vector3): void {
        if (Math.random() > POWERUP_SPAWN_CHANCE) return;
        const powerUpTypeValues = Object.values(PowerUpType).filter(
            (value) => typeof value === 'string'
        ) as PowerUpType[];
        if (powerUpTypeValues.length === 0) {
            console.warn("No PowerUpTypes available to spawn.");
            return;
        }
        const randomIndex = Math.floor(Math.random() * powerUpTypeValues.length);
        const randomType = powerUpTypeValues[randomIndex];
        if (randomType === undefined) { 
            console.warn("Could not determine a random PowerUpType in spawnPowerUp.");
            return;
        }
        const powerUp = new PowerUp(randomType, position, POWERUP_DURATION);
        this.scene.add(powerUp.getMesh());
        this.powerUps.push(powerUp);
    }

    public update(playerTank: PlayerTank, currentTime: number): void {
        this.updatePowerUpEffects(currentTime);
        this.updateActivePowerUps(playerTank);
    }

    private updatePowerUpEffects(currentTime: number): void {
        if (this.isPlayerInvulnerable && currentTime > this.invulnerableEndTime) {
            this.isPlayerInvulnerable = false;
            if (this.playerShield) {
                this.scene.remove(this.playerShield);
                this.playerShield = undefined;
            }
        }
        if (this.isMachineGunActive && currentTime > this.machineGunEndTime) {
            this.isMachineGunActive = false;
        }
        if (this.areEnemiesFrozen && currentTime > this.frozenEndTime) {
            this.areEnemiesFrozen = false;
        }
    }

    private updateActivePowerUps(playerTank: PlayerTank): void {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (!powerUp) continue;
            if (powerUp.isExpired()) {
                this.scene.remove(powerUp.getMesh());
                this.powerUps.splice(i, 1);
                continue;
            }
            const mesh = powerUp.getMesh();
            mesh.rotation.y += 0.05;
            if (playerTank && mesh.position.distanceTo(playerTank.getPosition()) < 1.5) {
                this.collectPowerUp(powerUp, playerTank);
                this.scene.remove(mesh);
                this.powerUps.splice(i, 1);
            }
        }
    }

    private collectPowerUp(powerUp: PowerUp, playerTank: PlayerTank): void {
        if (!powerUp) return;
        const currentTime = Date.now();
        let message = "";
        switch (powerUp.getType()) {
            case PowerUpType.STAR:
                this.game.increasePlayerLives(1); 
                message = "Extra Life!";
                break;
            case PowerUpType.HELMET:
                this.activatePlayerInvulnerability(HELMET_DURATION, playerTank);
                message = "Invulnerability!";
                break;
            case PowerUpType.BOMB:
                message = "Boom! All enemies destroyed!";
                this.game.destroyAllEnemies(); 
                break;
            case PowerUpType.MACHINE_GUN:
                this.activateMachineGun(MACHINE_GUN_DURATION);
                message = "Machine Gun!";
                break;
            case PowerUpType.CLOCK:
                this.activateEnemyFreeze(CLOCK_DURATION);
                message = "Enemies Frozen!";
                break;
            case PowerUpType.BASE_PROTECTION:
                message = "Base Protected!";
                this.game.repairBaseProtection(); 
                break;
        }
        if (message) {
            this.ui.showMessage(message, 2000);
        }
    }

    public activatePlayerInvulnerability(duration: number, playerTank: PlayerTank): void {
        this.isPlayerInvulnerable = true;
        this.invulnerableEndTime = Date.now() + duration;
        if (this.playerShield) { 
            this.scene.remove(this.playerShield);
        }
        this.playerShield = this.effectsManager.createPlayerShield(playerTank.getPosition());
    }

    public clearPlayerShield(): void {
        if (this.playerShield) {
            this.scene.remove(this.playerShield);
            this.playerShield = undefined;
        }
    }

    public activateMachineGun(duration: number): void {
        this.isMachineGunActive = true;
        this.machineGunEndTime = Date.now() + duration;
    }
    
    public activateEnemyFreeze(duration: number): void {
        this.areEnemiesFrozen = true;
        this.frozenEndTime = Date.now() + duration;
    }
} 