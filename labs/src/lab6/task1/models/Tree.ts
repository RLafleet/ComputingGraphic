import * as THREE from 'three';

export class Tree {
    private mesh: THREE.Group;

    constructor() {
        this.mesh = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();
        const barkTexture = textureLoader.load('/textures/bark.jpg');
        const leavesTexture = textureLoader.load('/textures/leaves.jpg');

        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            map: barkTexture,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        this.mesh.add(trunk);

        const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({
            map: leavesTexture,
            roughness: 0.8,
            metalness: 0.1
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 3;
        leaves.castShadow = true;
        this.mesh.add(leaves);
    }

    public getMesh(): THREE.Group {
        return this.mesh;
    }
} 