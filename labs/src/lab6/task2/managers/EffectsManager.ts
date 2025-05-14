import * as THREE from 'three';
import { BlockType } from '../models/terrain/Block';

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

    public createExplosionEffect(position: THREE.Vector3): void {
        const explosionGroup = new THREE.Group();
        explosionGroup.position.copy(position);
        this.scene.add(explosionGroup);
        const flashGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        explosionGroup.add(flash);
        const coreGeometry = new THREE.SphereGeometry(1, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF5500,
            transparent: true,
            opacity: 0.9
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        explosionGroup.add(core);
        const particleCount = 60;
        const particleGeometries = [
            new THREE.SphereGeometry(0.3, 4, 4),
            new THREE.SphereGeometry(0.2, 4, 4)
        ];
        const particleMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xFF3300 }),
            new THREE.MeshBasicMaterial({ color: 0xFF7700 }),
            new THREE.MeshBasicMaterial({ color: 0xFFAA00 }),
            new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.7 }),
            new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.5 })
        ];
        const particles: THREE.Mesh[] = [];
        const particleVelocities: THREE.Vector3[] = [];
        for (let i = 0; i < particleCount; i++) {
            const geomIndex = Math.random() > 0.6 ? 1 : 0;
            const matIndex = Math.floor(Math.random() * particleMaterials.length);
            const selectedMaterial = particleMaterials[matIndex];
            if (!selectedMaterial) continue;
            const particle = new THREE.Mesh(
                particleGeometries[geomIndex],
                selectedMaterial.clone()
            );
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            ).normalize();
            const distance = Math.random() * 0.5;
            particle.position.copy(direction).multiplyScalar(distance);
            const velocity = direction.clone().multiplyScalar(0.03 + Math.random() * 0.07);
            particleVelocities.push(velocity);
            explosionGroup.add(particle);
            particles.push(particle);
        }
        const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.rotation.x = Math.PI / 2;
        explosionGroup.add(shockwave);
        let frame = 0;
        const animateExplosion = () => {
            frame++;
            if (frame < 5) {
                flash.scale.set(1 + frame * 0.4, 1 + frame * 0.4, 1 + frame * 0.4);
                if (flash.material instanceof THREE.Material && 'opacity' in flash.material) {
                    flash.material.opacity = Math.max(0, 0.8 - frame * 0.2);
                }
            } else if (flash.parent === explosionGroup) {
                explosionGroup.remove(flash);
            }
            if (frame < 10) {
                core.scale.set(1 + frame * 0.2, 1 + frame * 0.2, 1 + frame * 0.2);
                if (core.material instanceof THREE.Material && 'opacity' in core.material) {
                    core.material.opacity = Math.max(0, 0.9 - frame * 0.09);
                }
            } else if (core.parent === explosionGroup) {
                explosionGroup.remove(core);
            }
            if (frame < 20) {
                const scale = 1 + frame * 0.3;
                shockwave.scale.set(scale, scale, scale);
                if (shockwave.material instanceof THREE.Material && 'opacity' in shockwave.material) {
                    shockwave.material.opacity = Math.max(0, 0.7 - frame * 0.035);
                }
            } else if (shockwave.parent === explosionGroup) {
                explosionGroup.remove(shockwave);
            }
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                const velocity = particleVelocities[i];
                if(!particle || !velocity) continue;
                particle.position.add(velocity);
                velocity.multiplyScalar(0.96);
                if (frame > 10) {
                    particle.scale.multiplyScalar(0.97);
                    if (particle.material instanceof THREE.Material && 'opacity' in particle.material) {
                        particle.material.opacity *= 0.97;
                    }
                }
            }
            if (frame < 60) {
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(explosionGroup);
            }
        };
        animateExplosion();
    }

    public createBulletExplosion(position: THREE.Vector3): void {
        const explosionGroup = new THREE.Group();
        explosionGroup.position.copy(position);
        this.scene.add(explosionGroup);
        const flashGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        explosionGroup.add(flash);
        const particleCount = 30;
        const sparkGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const sparkMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xFF3300 }),
            new THREE.MeshBasicMaterial({ color: 0xFFAA00 }),
            new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
        ];
        const sparks: THREE.Mesh[] = [];
        const sparkVelocities: THREE.Vector3[] = [];
        for (let i = 0; i < particleCount; i++) {
            const matIndex = Math.floor(Math.random() * sparkMaterials.length);
            const sparkMaterial = sparkMaterials[matIndex];
            if (!sparkMaterial) continue;
            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial.clone());
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 1.5,
                (Math.random() - 0.5) * 2
            ).normalize();
            spark.position.copy(direction).multiplyScalar(0.1);
            const velocity = direction.clone().multiplyScalar(0.02 + Math.random() * 0.05);
            sparkVelocities.push(velocity);
            explosionGroup.add(spark);
            sparks.push(spark);
        }
        let frame = 0;
        const animateExplosion = () => {
            frame++;
            if (frame < 5) {
                flash.scale.set(1 + frame * 0.2, 1 + frame * 0.2, 1 + frame * 0.2);
                if (flash.material instanceof THREE.Material && 'opacity' in flash.material) {
                    flash.material.opacity = Math.max(0, 0.8 - frame * 0.2);
                }
            } else if (flash.parent === explosionGroup) {
                explosionGroup.remove(flash);
            }
            for (let i = 0; i < sparks.length; i++) {
                const spark = sparks[i];
                const velocity = sparkVelocities[i];
                if(!spark || !velocity) continue;
                spark.position.add(velocity);
                velocity.y -= 0.001;
                velocity.multiplyScalar(0.95);
                if (frame > 5) {
                    spark.scale.multiplyScalar(0.96);
                    if (spark.material instanceof THREE.Material && 'opacity' in spark.material) {
                        spark.material.opacity *= 0.96;
                    }
                }
            }
            if (frame < 30) {
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(explosionGroup);
            }
        };
        animateExplosion();
    }
    
    public createSteelDestructionEffect(position: THREE.Vector3): void {
        const effectGroup = new THREE.Group();
        effectGroup.position.copy(position);
        this.scene.add(effectGroup);
        const flashGeometry = new THREE.SphereGeometry(0.8, 12, 12);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFCC00,
            transparent: true,
            opacity: 0.9
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        effectGroup.add(flash);
        const fragmentCount = 15;
        const fragmentGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const fragmentMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.2
        });
        const fragments: THREE.Mesh[] = [];
        const velocities: THREE.Vector3[] = [];
        for (let i = 0; i < fragmentCount; i++) {
            const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
            fragment.position.set(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            fragment.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            const scale = 0.5 + Math.random() * 1.0;
            fragment.scale.set(scale, scale, scale);
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.15,
                (Math.random() - 0.5) * 0.2
            );
            effectGroup.add(fragment);
            fragments.push(fragment);
            velocities.push(velocity);
        }
        const sparkCount = 20;
        const sparkGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const sparkMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xFF6600 }),
            new THREE.MeshBasicMaterial({ color: 0xFFCC00 })
        ];
        const sparks: THREE.Mesh[] = [];
        const sparkVelocities: THREE.Vector3[] = [];
        for (let i = 0; i < sparkCount; i++) {
            const sparkMaterial = sparkMaterials[Math.floor(Math.random() * sparkMaterials.length)];
            if (!sparkMaterial) continue;
            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
            spark.position.set(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.3
            );
            effectGroup.add(spark);
            sparks.push(spark);
            sparkVelocities.push(velocity);
        }
        let frame = 0;
        const animateEffect = () => {
            frame++;
            if (frame < 5) {
                flash.scale.multiplyScalar(1.2);
                if (flash.material instanceof THREE.Material && 'opacity' in flash.material && flash.material.opacity !== undefined) {
                    flash.material.opacity *= 0.8;
                }
            } else if (flash.parent === effectGroup) {
                effectGroup.remove(flash);
            }
            for (let i = 0; i < fragments.length; i++) {
                const fragment = fragments[i];
                const velocity = velocities[i];
                if (!fragment || !velocity) continue;
                fragment.position.add(velocity);
                velocity.y -= 0.01;
                fragment.rotation.x += 0.1;
                fragment.rotation.y += 0.05;
                velocity.multiplyScalar(0.95);
            }
            for (let i = 0; i < sparks.length; i++) {
                const spark = sparks[i];
                const velocity = sparkVelocities[i];
                if (!spark || !velocity) continue;
                spark.position.add(velocity);
                velocity.y -= 0.01;
                if (spark.scale.x > 0.1) {
                    spark.scale.multiplyScalar(0.92);
                }
            }
            if (frame < 40) {
                requestAnimationFrame(animateEffect);
            } else {
                this.scene.remove(effectGroup);
            }
        };
        animateEffect();
    }
    public createBlockDestructionEffect(position: THREE.Vector3, blockType: BlockType): void {
        let color = 0xA52A2A;
        if (blockType === BlockType.TREES) {
            color = 0x2E8B57;
        }
        const effectGroup = new THREE.Group();
        effectGroup.position.copy(position);
        this.scene.add(effectGroup);
        const particleCount = 15;
        const particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const particleMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.9
        });
        const particles: THREE.Mesh[] = [];
        const velocities: THREE.Vector3[] = [];
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
            particle.position.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.5
            );
            const scale = 0.5 + Math.random() * 0.8;
            particle.scale.set(scale, scale, scale);
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.15,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.15
            );
            effectGroup.add(particle);
            particles.push(particle);
            velocities.push(velocity);
        }
        if (blockType === BlockType.BRICK) {
            const dustCount = 10;
            const dustGeometry = new THREE.SphereGeometry(0.15, 4, 4);
            const dustMaterial = new THREE.MeshBasicMaterial({
                color: 0xBBBBBB,
                transparent: true,
                opacity: 0.7
            });
            for (let i = 0; i < dustCount; i++) {
                const dust = new THREE.Mesh(dustGeometry, dustMaterial.clone());
                dust.position.set(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                const scale = 0.5 + Math.random() * 1.0;
                dust.scale.set(scale, scale, scale);
                const velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.08,
                    Math.random() * 0.05,
                    (Math.random() - 0.5) * 0.08
                );
                effectGroup.add(dust);
                particles.push(dust);
                velocities.push(velocity);
            }
        }
        let frame = 0;
        const animateEffect = () => {
            frame++;
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                const velocity = velocities[i];
                if (!particle || !velocity) continue;
                particle.position.add(velocity);
                velocity.y -= 0.005;
                particle.rotation.x += 0.05;
                particle.rotation.y += 0.05;
                velocity.multiplyScalar(0.95);
                if (frame > 5) {
                    particle.scale.multiplyScalar(0.95);
                    if (particle.material instanceof THREE.Material && 'opacity' in particle.material && particle.material.opacity !== undefined) {
                        particle.material.opacity *= 0.95;
                    }
                }
            }
            if (frame < 30) {
                requestAnimationFrame(animateEffect);
            } else {
                this.scene.remove(effectGroup);
            }
        };
        animateEffect();
    }
} 