import * as THREE from 'three';

export class House {
    private mesh: THREE.Group;

    constructor() {
        this.mesh = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();
        const wallTexture = textureLoader.load('/textures/wall.jpg');
        const roofTexture = textureLoader.load('/textures/roof.jpg');
        const doorTexture = textureLoader.load('/textures/door.jpg');
        const windowTexture = textureLoader.load('/textures/window.jpg');

        const houseGeometry = new THREE.BoxGeometry(4, 3, 4);
        const houseMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            roughness: 0.7,
            metalness: 0.1
        });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = 1.5;
        house.castShadow = true;
        house.receiveShadow = true;
        this.mesh.add(house);

        const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
            map: roofTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 4;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.mesh.add(roof);

        const doorGeometry = new THREE.PlaneGeometry(1, 2);
        const doorMaterial = new THREE.MeshStandardMaterial({
            map: doorTexture,
            roughness: 0.5,
            metalness: 0.2
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1, 2.01);
        door.receiveShadow = true;
        this.mesh.add(door);

        const windowGeometry = new THREE.PlaneGeometry(0.8, 0.8);
        const windowMaterial = new THREE.MeshStandardMaterial({
            map: windowTexture,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.6
        });

        const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        frontWindow.position.set(1.5, 1.5, 2.01);
        frontWindow.receiveShadow = true;
        this.mesh.add(frontWindow);

        const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        backWindow.position.set(-1.5, 1.5, -2.01);
        backWindow.rotation.y = Math.PI;
        backWindow.receiveShadow = true;
        this.mesh.add(backWindow);

        const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        leftWindow.position.set(-2.01, 1.5, 0);
        leftWindow.rotation.y = Math.PI / 2;
        leftWindow.receiveShadow = true;
        this.mesh.add(leftWindow);

        const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        rightWindow.position.set(2.01, 1.5, 0);
        rightWindow.rotation.y = -Math.PI / 2;
        rightWindow.receiveShadow = true;
        this.mesh.add(rightWindow);
    }

    public getMesh(): THREE.Group {
        return this.mesh;
    }
} 