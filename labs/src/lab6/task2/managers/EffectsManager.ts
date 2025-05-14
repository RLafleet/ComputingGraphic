import * as THREE from 'three';
import { BlockType } from '../models/terrain/Block';
import { ExplosionEffectAnimation } from '../effects/ExplosionEffectAnimation';
import { BulletExplosionAnimation } from '../effects/BulletExplosionAnimation';
import { SteelDestructionEffectAnimation } from '../effects/SteelDestructionEffectAnimation';
import { BlockDestructionEffectAnimation } from '../effects/BlockDestructionEffectAnimation';

export class EffectsManager {
    private scene: THREE.Scene;
    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }
    
    public createPlayerShield(playerPosition: THREE.Vector3): THREE.Mesh {
        const shieldGeometry = new THREE.SphereGeometry(2, 16, 16);
        const shieldMaterial = new THREE.MeshStandardMaterial({
            color: 0x00FF00,
            transparent: true,
            opacity: 0.3,
            emissive: 0x00FF00,
            emissiveIntensity: 0.5
        });
        const playerShield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        playerShield.position.copy(playerPosition);
        playerShield.position.y = 1;
        this.scene.add(playerShield);
        return playerShield;
    }

    // разделить игровое состояние от визуализации
    public createExplosionEffect(position: THREE.Vector3): void {
        const explosionAnimation = new ExplosionEffectAnimation(this.scene, position);
        explosionAnimation.play();
    }

    public createBulletExplosion(position: THREE.Vector3): void {
        const bulletExplosionAnimation = new BulletExplosionAnimation(this.scene, position);
        bulletExplosionAnimation.play();
    }
    
    public createSteelDestructionEffect(position: THREE.Vector3): void {
        const steelDestructionAnimation = new SteelDestructionEffectAnimation(this.scene, position);
        steelDestructionAnimation.play();
    }
    public createBlockDestructionEffect(position: THREE.Vector3, blockType: BlockType): void {
        const blockDestructionAnimation = new BlockDestructionEffectAnimation(this.scene, position, blockType);
        blockDestructionAnimation.play();
    }
} 