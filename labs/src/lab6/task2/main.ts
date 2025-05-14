import * as THREE from 'three';
import { Game } from './Game';

function setupScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    return scene;
}

function setupCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 35, 25);
    camera.lookAt(0, 0, 0);
    return camera;
}

function setupRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    return renderer;
}

function setupLighting(scene: THREE.Scene): void {
    const ambientLight = new THREE.AmbientLight(0x606060, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFCC, 1.5);
    directionalLight.position.set(15, 40, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -35;
    directionalLight.shadow.camera.right = 35;
    directionalLight.shadow.camera.top = 35;
    directionalLight.shadow.camera.bottom = -35;
    directionalLight.shadow.bias = -0.001;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xCCCCFF, 0.5);
    backLight.position.set(-15, 20, -15);
    scene.add(backLight);
}

function createInstructionPanel(): HTMLElement {
    const instructions = document.createElement('div');
    instructions.id = 'instructionPanel';
    instructions.style.position = 'absolute';
    instructions.style.top = '50%';
    instructions.style.left = '50%';
    instructions.style.transform = 'translate(-50%, -50%)';
    instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    instructions.style.color = 'white';
    instructions.style.padding = '25px';
    instructions.style.borderRadius = '15px';
    instructions.style.fontFamily = 'Verdana, sans-serif';
    instructions.style.textAlign = 'center';
    instructions.style.zIndex = '1000';
    instructions.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
    instructions.innerHTML = `
        <h2 style="margin-top: 0; color: #FFD700;">Battle City 3D</h2>
        <p>WASD / Стрелки - Движение</p>
        <p>Пробел - Стрельба</p>
        <p style="font-size: 0.9em; margin-top: 20px;">Уничтожьте врагов и защитите базу!</p>
        <p style="margin-top: 25px; font-size: 0.8em; color: #cccccc;">Нажмите любую клавишу, чтобы начать...</p>
    `;
    document.body.appendChild(instructions);
    return instructions;
}

function main(): void {
    const scene = setupScene();
    const camera = setupCamera();
    const renderer = setupRenderer();
    setupLighting(scene);

    const game = new Game(scene, camera);

    const instructionPanel = createInstructionPanel();
    const hideInstructions = () => {
        instructionPanel.style.display = 'none';
        window.removeEventListener('keydown', hideInstructions, true);
        window.removeEventListener('mousedown', hideInstructions, true);
    };
    window.addEventListener('keydown', hideInstructions, { capture: true, once: true });
    window.addEventListener('mousedown', hideInstructions, { capture: true, once: true });


    function animate(): void {
        requestAnimationFrame(animate);
        if (instructionPanel.style.display !== 'none') {
            //TODO что-то на бэк можно
        } else {
            game.update();
        }
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

main(); 