import * as THREE from 'three';

export class BulletExplosionAnimation {
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

            const spark = new THREE.Mesh(sparkGeometry.clone(), sparkMaterial.clone()); 
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
        const scene = this.scene; 

        const animateExplosion = () => {
            frame++;

            if (frame < 5) {
                flash.scale.set(1 + frame * 0.2, 1 + frame * 0.2, 1 + frame * 0.2);
                if (flash.material instanceof THREE.Material && 'opacity' in flash.material) {
                    flash.material.opacity = Math.max(0, 0.8 - frame * 0.2);
                }
            } else if (flash.parent === explosionGroup) {
                explosionGroup.remove(flash);
                flash.geometry.dispose();
                if (flash.material instanceof THREE.Material) flash.material.dispose();
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
                sparks.forEach(spark => {
                    explosionGroup.remove(spark);
                    spark.geometry.dispose(); 
                    if (spark.material instanceof THREE.Material) spark.material.dispose(); 
                });
                sparkGeometry.dispose(); 
                scene.remove(explosionGroup);
            }
        };
        animateExplosion();
    }
} 