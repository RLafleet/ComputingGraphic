import * as THREE from 'three';

export class SteelDestructionEffectAnimation {
    private scene: THREE.Scene;
    private position: THREE.Vector3;

    constructor(scene: THREE.Scene, position: THREE.Vector3) {
        this.scene = scene;
        this.position = position;
    }

    public play(): void {
        const effectGroup = new THREE.Group();
        effectGroup.position.copy(this.position);
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
            const fragment = new THREE.Mesh(fragmentGeometry.clone(), fragmentMaterial.clone()); 
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
            const spark = new THREE.Mesh(sparkGeometry.clone(), sparkMaterial.clone()); 
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
        const scene = this.scene; 

        const animateEffect = () => {
            frame++;

            if (frame < 5) {
                flash.scale.multiplyScalar(1.2);
                if (flash.material instanceof THREE.Material && 'opacity' in flash.material && flash.material.opacity !== undefined) {
                    flash.material.opacity *= 0.8;
                }
            } else if (flash.parent === effectGroup) {
                effectGroup.remove(flash);
                flash.geometry.dispose();
                if (flash.material instanceof THREE.Material) flash.material.dispose();
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
                fragments.forEach(fragment => {
                    effectGroup.remove(fragment);
                    fragment.geometry.dispose();
                    if (fragment.material instanceof THREE.Material) fragment.material.dispose();
                });
                sparks.forEach(spark => {
                    effectGroup.remove(spark);
                    spark.geometry.dispose();
                    if (spark.material instanceof THREE.Material) spark.material.dispose();
                });
                fragmentGeometry.dispose(); 
                sparkGeometry.dispose(); 
                scene.remove(effectGroup);
            }
        };
        animateEffect();
    }
} 