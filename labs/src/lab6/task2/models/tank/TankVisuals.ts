import * as THREE from 'three';
import { TankType } from './TankTypes';

export class TankVisuals {
    public static createStarGeometry(innerRadius: number, outerRadius: number, points: number): THREE.BufferGeometry {
        const vertices = [];
        const step = Math.PI / points;
        for (let i = 0; i <= points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step;
            vertices.push(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex([
            0, 1, 9,
            1, 2, 3,
            3, 4, 5,
            5, 6, 7,
            7, 8, 9,
            1, 3, 5,
            5, 7, 9,
            1, 5, 9
        ]);
        return geometry;
    }

    public static createMuzzleFlash(direction: THREE.Vector3, tankPosition: THREE.Vector3, parent: THREE.Object3D): void {
        const flashGroup = new THREE.Group();
        const muzzlePosition = tankPosition.clone().add(
            new THREE.Vector3(0, 0.7, 0)
        ).add(direction.clone().multiplyScalar(1.2));
        flashGroup.position.copy(muzzlePosition);
        flashGroup.lookAt(tankPosition.clone().add(
            direction.clone().multiplyScalar(10)
        ));
        const coneGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.9
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = Math.PI / 2;
        flashGroup.add(cone);
        const coreGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 1.0
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.z = -0.1;
        flashGroup.add(core);
        const sparkCount = 5;
        const sparkGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const sparkMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF44,
            transparent: true,
            opacity: 0.9
        });
        for (let i = 0; i < sparkCount; i++) {
            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial.clone());
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.1 + Math.random() * 0.2;
            spark.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -0.1 + Math.random() * 0.4
            );
            flashGroup.add(spark);
        }
        parent.add(flashGroup);
        let frame = 0;
        const animateFlash = () => {
            frame++;
            if (frame < 5) {
                const scale = 1 - frame * 0.15;
                flashGroup.scale.set(scale, scale, scale);
                flashGroup.children.forEach(child => {
                    if (child instanceof THREE.Mesh && 
                        child.material instanceof THREE.Material && 
                        'opacity' in child.material) {
                        child.material.opacity *= 0.8;
                    }
                });
                requestAnimationFrame(animateFlash);
            } else {
                flashGroup.parent?.remove(flashGroup);
            }
        };
        animateFlash();
    }

    public static getTankColor(type: TankType): number {
        switch(type) {
            case TankType.PLAYER:
                return 0x2d5f25;
            case TankType.ENEMY_LIGHT:
                return 0x7a3232; 
            case TankType.ENEMY_MEDIUM:
                return 0x7a5732;
            case TankType.ENEMY_HEAVY:
                return 0x323c7a; 
            default:
                return 0x7a3232;
        }
    }

    public static getTurretColor(type: TankType): number {
        switch(type) {
            case TankType.PLAYER:
                return 0x1e4a1c;
            case TankType.ENEMY_LIGHT:
                return 0x5e2525;
            case TankType.ENEMY_MEDIUM:
                return 0x5e4525;
            case TankType.ENEMY_HEAVY:
                return 0x25305e;
            default:
                return 0x5e2525;
        }
    }
} 