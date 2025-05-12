import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { House } from './models/House';
import { Tree } from './models/Tree';
import { Swing } from './models/Swing';

export class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private swing: Swing;
    private clock: THREE.Clock;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Небо

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 10, 15);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.clock = new THREE.Clock();

        this.setupLights();

        this.createGround();

        this.addModels();

        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.animate();
    }

    private setupLights(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 50;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        this.scene.add(sunLight);
    }

    private createGround(): void {
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('/textures/grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(10, 10);

        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    private addModels(): void {
        const house = new House();
        house.getMesh().position.set(-5, 0, -5);
        this.scene.add(house.getMesh());

        const tree1 = new Tree();
        tree1.getMesh().position.set(5, 0, -8);
        this.scene.add(tree1.getMesh());

        const tree2 = new Tree();
        tree2.getMesh().position.set(8, 0, -5);
        this.scene.add(tree2.getMesh());

        const tree3 = new Tree();
        tree3.getMesh().position.set(6, 0, -2);
        this.scene.add(tree3.getMesh());

        this.swing = new Swing();
        this.swing.getMesh().position.set(0, 0, -3);
        this.scene.add(this.swing.getMesh());
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));

        const deltaTime = this.clock.getDelta();
        this.swing.update(deltaTime);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
} 