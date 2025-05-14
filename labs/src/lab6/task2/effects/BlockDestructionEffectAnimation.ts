import * as THREE from 'three';
import { BlockType } from '../models/terrain/Block'; 

export class BlockDestructionEffectAnimation {
    private scene: THREE.Scene;
    private position: THREE.Vector3;
    private blockType: BlockType;

    constructor(scene: THREE.Scene, position: THREE.Vector3, blockType: BlockType) {
        this.scene = scene;
        this.position = position;
        this.blockType = blockType;
    }

    public play(): void {
        let color = 0xA52A2A; 
        if (this.blockType === BlockType.TREES) {
            color = 0x2E8B57;
        }

        const effectGroup = new THREE.Group();
        effectGroup.position.copy(this.position);
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
            const particle = new THREE.Mesh(particleGeometry.clone(), particleMaterial.clone());
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

        if (this.blockType === BlockType.BRICK) {
            const dustCount = 10;
            const dustGeometry = new THREE.SphereGeometry(0.15, 4, 4);
            const dustMaterial = new THREE.MeshBasicMaterial({
                color: 0xBBBBBB,
                transparent: true,
                opacity: 0.7
            });
            for (let i = 0; i < dustCount; i++) {
                const dust = new THREE.Mesh(dustGeometry.clone(), dustMaterial.clone());
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
        const scene = this.scene; 

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
                particles.forEach(particle => {
                    effectGroup.remove(particle);
                    particle.geometry.dispose();
                    if (particle.material instanceof THREE.Material) particle.material.dispose();
                });
                scene.remove(effectGroup);
            }
        };
        animateEffect();
    }
} 