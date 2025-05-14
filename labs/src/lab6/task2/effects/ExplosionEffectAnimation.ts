import * as THREE from 'three';

export class ExplosionEffectAnimation {
    private scene: THREE.Scene;
    private position: THREE.Vector3;

    constructor(scene: THREE.Scene, position: THREE.Vector3) {
        this.scene = scene;
        this.position = position;
    }

    public play(): void {
        const explosionGroup = new THREE.Group();
        explosionGroup.position.copy(this.position);
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
        const scene = this.scene; 

        const animateExplosion = () => {
            frame++;

            if (frame < 5) {
                flash.scale.set(1 + frame * 0.4, 1 + frame * 0.4, 1 + frame * 0.4);
                if (flash.material instanceof THREE.Material && 'opacity' in flash.material) {
                    flash.material.opacity = Math.max(0, 0.8 - frame * 0.2);
                }
            } else if (flash.parent === explosionGroup) {
                explosionGroup.remove(flash);
                flash.geometry.dispose();
                if (flash.material instanceof THREE.Material) flash.material.dispose();
            }

            if (frame < 10) {
                core.scale.set(1 + frame * 0.2, 1 + frame * 0.2, 1 + frame * 0.2);
                if (core.material instanceof THREE.Material && 'opacity' in core.material) {
                    core.material.opacity = Math.max(0, 0.9 - frame * 0.09);
                }
            } else if (core.parent === explosionGroup) {
                explosionGroup.remove(core);
                core.geometry.dispose();
                if (core.material instanceof THREE.Material) core.material.dispose();
            }

            if (frame < 20) {
                const scale = 1 + frame * 0.3;
                shockwave.scale.set(scale, scale, scale);
                if (shockwave.material instanceof THREE.Material && 'opacity' in shockwave.material) {
                    shockwave.material.opacity = Math.max(0, 0.7 - frame * 0.035);
                }
            } else if (shockwave.parent === explosionGroup) {
                explosionGroup.remove(shockwave);
                shockwave.geometry.dispose();
                if (shockwave.material instanceof THREE.Material) shockwave.material.dispose();
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
                particles.forEach(particle => {
                    explosionGroup.remove(particle);
                    particle.geometry.dispose();
                    if (particle.material instanceof THREE.Material) particle.material.dispose();
                });
                scene.remove(explosionGroup); 
            }
        };

        animateExplosion();
    }
} 