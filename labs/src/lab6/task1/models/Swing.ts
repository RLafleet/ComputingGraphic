import * as THREE from 'three';

export class Swing {
    private mesh: THREE.Group;
    private seat: THREE.Mesh;
    private leftChain: THREE.Mesh;
    private rightChain: THREE.Mesh;
    private time: number = 0;
    private swingSpeed: number = 2;
    private maxSwingAngle: number = Math.PI / 6;

    constructor() {
        this.mesh = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('/textures/wood.jpg');
        const metalTexture = textureLoader.load('/textures/metal.jpg');

        const supportGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const supportMaterial = new THREE.MeshStandardMaterial({
            map: metalTexture,
            roughness: 0.5,
            metalness: 0.8
        });

        const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        leftSupport.position.set(-1, 1.5, 0);
        leftSupport.castShadow = true;
        this.mesh.add(leftSupport);

        const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        rightSupport.position.set(1, 1.5, 0);
        rightSupport.castShadow = true;
        this.mesh.add(rightSupport);

        const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8);
        const beam = new THREE.Mesh(beamGeometry, supportMaterial);
        beam.position.set(0, 3, 0);
        beam.rotation.z = Math.PI / 2;
        beam.castShadow = true;
        this.mesh.add(beam);

        const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
        const seatMaterial = new THREE.MeshStandardMaterial({
            map: woodTexture,
            roughness: 0.7,
            metalness: 0.2
        });
        this.seat = new THREE.Mesh(seatGeometry, seatMaterial);
        this.seat.position.set(0, 1.5, 0);
        this.seat.castShadow = true;
        this.mesh.add(this.seat);

        const chainMaterial = new THREE.MeshStandardMaterial({
            map: metalTexture,
            roughness: 0.3,
            metalness: 0.9
        });

        const leftChainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
        this.leftChain = new THREE.Mesh(leftChainGeometry, chainMaterial);
        this.leftChain.position.set(-0.4, 2.25, 0);
        this.leftChain.castShadow = true;
        this.mesh.add(this.leftChain);

        const rightChainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
        this.rightChain = new THREE.Mesh(rightChainGeometry, chainMaterial);
        this.rightChain.position.set(0.4, 2.25, 0);
        this.rightChain.castShadow = true;
        this.mesh.add(this.rightChain);
    }

    public update(deltaTime: number): void {
        this.time += deltaTime * this.swingSpeed;
        const swingAngle = Math.sin(this.time) * this.maxSwingAngle;
        
        this.seat.position.x = Math.sin(swingAngle) * 0.5;
        this.seat.position.z = Math.cos(swingAngle) * 0.5;
        
        this.leftChain.position.x = -0.4 + Math.sin(swingAngle) * 0.5;
        this.leftChain.position.z = Math.cos(swingAngle) * 0.5;
        this.leftChain.rotation.z = swingAngle;
        
        this.rightChain.position.x = 0.4 + Math.sin(swingAngle) * 0.5;
        this.rightChain.position.z = Math.cos(swingAngle) * 0.5;
        this.rightChain.rotation.z = swingAngle;
    }

    public getMesh(): THREE.Group {
        return this.mesh;
    }
} 