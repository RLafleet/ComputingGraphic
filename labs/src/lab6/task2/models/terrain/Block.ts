import * as THREE from 'three';

export enum BlockType {
    GROUND = 'ground',
    BRICK = 'brick',
    STEEL = 'steel',
    WATER = 'water',
    TREES = 'trees',
    HQ = 'hq' 
}

export interface Block {
    mesh: THREE.Mesh;
    blockType: BlockType;
    isDestructible: boolean;
    isPassableByTanks: boolean;
    isPassableByBullets: boolean;
    health?: number; 
    maxHealth?: number; 
    destroy?: () => void; 
}

const LOW_DETAIL_MODE = true;

export function createBlock(type: BlockType, position: THREE.Vector3): THREE.Mesh {
    const blockSize = 1; 
    let blockMesh;
    switch (type) {
        case BlockType.GROUND:
            const groundGeometry = new THREE.BoxGeometry(blockSize, 0.1, blockSize);
            const groundMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x964B00,
                roughness: 0.8,
                metalness: 0.1
            });
            blockMesh = new THREE.Mesh(groundGeometry, groundMaterial);
            blockMesh.position.copy(position);
            blockMesh.position.y = 0.05; 
            break;
        case BlockType.BRICK:
            blockMesh = createBrickWall(blockSize, position);
            break;
        case BlockType.STEEL:
            blockMesh = createSteelWall(blockSize, position);
            break;
        case BlockType.WATER:
            blockMesh = createWater(blockSize, position);
            break;
        case BlockType.TREES:
            blockMesh = createTreesGroup(blockSize, position);
            break;
        case BlockType.HQ:
            blockMesh = createHeadquarters(blockSize, position);
            break;
        default:
            const defaultGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
            const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            blockMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
            blockMesh.position.copy(position);
            blockMesh.position.y = 0.5;
            break;
    }
    blockMesh.castShadow = type === BlockType.BRICK || type === BlockType.STEEL || type === BlockType.HQ;
    blockMesh.receiveShadow = true;
    blockMesh.userData = {
        blockType: type,
        isDestructible: type === BlockType.BRICK || (type === BlockType.STEEL && true), 
        isPassableByTanks: type === BlockType.GROUND || type === BlockType.ICE,
        isPassableByBullets: type === BlockType.GROUND || type === BlockType.WATER || type === BlockType.ICE || type === BlockType.TREES,
        health: type === BlockType.STEEL ? 100 : (type === BlockType.BRICK ? 25 : 0), 
        maxHealth: type === BlockType.STEEL ? 100 : (type === BlockType.BRICK ? 25 : 0)  
    };
    return blockMesh;
}

function createWater(size: number, position: THREE.Vector3): THREE.Mesh {
    const waterGroup = new THREE.Group();
    const baseGeometry = new THREE.BoxGeometry(size, 0.3, size);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x0055AA,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.3
    });
    const waterBase = new THREE.Mesh(baseGeometry, baseMaterial);
    waterBase.position.set(0, 0, 0);
    waterGroup.add(waterBase);
    const surfaceCount = 3;
    const waveVertices: { x: number, y: number, z: number, ang: number, amp: number, speed: number }[][] = [];
    const waveObjects: THREE.Mesh[] = [];
    for (let i = 0; i < surfaceCount; i++) {
        const waveGeometry = new THREE.PlaneGeometry(size * 0.9, size * 0.9, 8, 8);
        const waveMaterial = new THREE.MeshStandardMaterial({
            color: 0x66CCFF,
            transparent: true,
            opacity: 0.4,
            roughness: 0.2,
            metalness: 0.8,
            side: THREE.DoubleSide
        });
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        wave.rotation.x = -Math.PI / 2; 
        wave.position.y = 0.15 + i * 0.03; 
        waterGroup.add(wave);
        waveObjects.push(wave);
        const posAttr = waveGeometry.getAttribute('position');
        const vertices: { x: number, y: number, z: number, ang: number, amp: number, speed: number }[] = [];
        for (let j = 0; j < posAttr.count; j++) {
            vertices.push({
                x: posAttr.getX(j),
                y: posAttr.getY(j),
                z: posAttr.getZ(j),
                ang: Math.random() * Math.PI * 2, 
                amp: Math.random() * 0.05 + 0.03, 
                speed: Math.random() * 0.5 + 0.5  
            });
        }
        waveVertices.push(vertices);
    }
    const highlightGeometry = new THREE.PlaneGeometry(size * 0.5, size * 0.5);
    const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlight.rotation.x = -Math.PI / 2;
    highlight.position.y = 0.25;
    waterGroup.add(highlight);
    if (!LOW_DETAIL_MODE) {
        for (let i = 0; i < 12; i++) {
            const bubbleSize = Math.random() * 0.08 + 0.02;
            const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 8, 8);
            const bubbleMaterial = new THREE.MeshStandardMaterial({
                color: 0xADEEFF,
                transparent: true,
                opacity: 0.5
            });
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            const offsetX = (Math.random() - 0.5) * size * 0.7;
            const offsetZ = (Math.random() - 0.5) * size * 0.7;
            bubble.position.set(offsetX, 0.17, offsetZ);
            bubble.userData = {
                startY: bubble.position.y,
                speed: Math.random() * 0.01 + 0.005,
                range: Math.random() * 0.05 + 0.02
            };
            waterGroup.add(bubble);
        }
    }
    const combinedGeometry = new THREE.BoxGeometry(size, 0.3, size);
    const combinedMaterial = baseMaterial.clone();
    const combinedMesh = new THREE.Mesh(combinedGeometry, combinedMaterial);
    combinedMesh.position.copy(position);
    combinedMesh.position.y = 0.15; 
    combinedMesh.add(waterGroup);
    const clock = new THREE.Clock();
    clock.start();
    const animateWater = () => {
        const time = clock.getElapsedTime();
        for (let i = 0; i < waveObjects.length; i++) {
            const wave = waveObjects[i];
            const vertices = waveVertices[i];
            if (!wave || !vertices) continue;
            const posAttr = wave.geometry.getAttribute('position');
            for (let j = 0; j < vertices.length; j++) {
                const vertex = vertices[j];
                if (!vertex) continue;
                posAttr.setZ(j, vertex.z + Math.sin(vertex.ang + time * vertex.speed) * vertex.amp);
            }
            posAttr.needsUpdate = true;
            wave.rotation.z = Math.sin(time * 0.1) * 0.05;
        }
        highlight.position.x = Math.sin(time * 0.2) * size * 0.15;
        highlight.position.z = Math.cos(time * 0.3) * size * 0.15;
        if (highlightMaterial.opacity !== undefined) {
            highlightMaterial.opacity = 0.1 + Math.abs(Math.sin(time * 0.5)) * 0.1;
        }
        waterGroup.children.forEach(child => {
            if (child.userData && child.userData['startY'] !== undefined) {
                const startY = child.userData['startY'] as number;
                const speed = child.userData['speed'] as number;
                const range = child.userData['range'] as number;
                child.position.y = startY + Math.sin(time * speed * 10) * range;
            }
        });
        requestAnimationFrame(animateWater);
    };
    animateWater();
    return combinedMesh;
}

function createBrickWall(size: number, position: THREE.Vector3): THREE.Mesh {
    const wallGroup = new THREE.Group();
    const wallGeometry = new THREE.BoxGeometry(size, size, size);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xA52A2A,
        roughness: 0.9,
        metalness: 0.0
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 0, 0);
    wallGroup.add(wall);
    if (!LOW_DETAIL_MODE) {
        const brickLinesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2F1B10,
            roughness: 1.0
        });
        for (let y = 0; y < 4; y++) {
            const lineGeometry = new THREE.BoxGeometry(size + 0.02, 0.05, size + 0.02);
            const line = new THREE.Mesh(lineGeometry, brickLinesMaterial);
            line.position.set(0, -size/2 + y * size/4, 0);
            wallGroup.add(line);
        }
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if ((y % 2 === 0 && x % 2 === 0) || (y % 2 === 1 && x % 2 === 1)) {
                    const lineGeometry = new THREE.BoxGeometry(0.05, size/4 - 0.05, size/3 - 0.05);
                    const line = new THREE.Mesh(lineGeometry, brickLinesMaterial);
                    line.position.set(-size/3 + x * size/3, -size/2 + size/8 + y * size/4, 0);
                    wallGroup.add(line);
                }
            }
        }
    }
    const combinedGeometry = new THREE.BoxGeometry(size, size, size);
    const combinedMesh = new THREE.Mesh(combinedGeometry, wallMaterial);
    combinedMesh.position.copy(position);
    combinedMesh.position.y = size/2;
    combinedMesh.add(wallGroup);
    return combinedMesh;
}

function createSteelWall(size: number, position: THREE.Vector3): THREE.Mesh {
    const wallGroup = new THREE.Group();
    const wallGeometry = new THREE.BoxGeometry(size, size, size);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7A7A7A,
        roughness: 0.3,
        metalness: 0.8
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 0, 0);
    wallGroup.add(wall);
    if (!LOW_DETAIL_MODE) {
        const edgeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x505050,
            roughness: 0.2,
            metalness: 0.9
        });
        for (let y = -1; y <= 1; y += 2) {
            const edgeGeometry = new THREE.BoxGeometry(size + 0.1, 0.1, size + 0.1);
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.position.set(0, y * size/2, 0);
            wallGroup.add(edge);
        }
        for (let x = -1; x <= 1; x += 2) {
            for (let z = -1; z <= 1; z += 2) {
                for (let y = -1; y <= 1; y += 2) {
                    const rivetGeometry = new THREE.SphereGeometry(0.07, 8, 8);
                    const rivet = new THREE.Mesh(rivetGeometry, edgeMaterial);
                    rivet.position.set(x * size/2.2, y * size/2.2, z * size/2.2);
                    wallGroup.add(rivet);
                }
            }
        }
    }
    const cracksGroup = new THREE.Group();
    cracksGroup.visible = false; 
    wallGroup.add(cracksGroup);
    const crackMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide
    });
    for (let i = 0; i < 5; i++) {
        const crackWidth = 0.05 + Math.random() * 0.1;
        const crackHeight = 0.3 + Math.random() * 0.5;
        const crackDepth = 0.05;
        const crackGeometry = new THREE.BoxGeometry(crackWidth, crackHeight, crackDepth);
        const crack = new THREE.Mesh(crackGeometry, crackMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.3 + 0.1;
        const xPos = Math.cos(angle) * radius;
        const yPos = Math.random() * 0.6 - 0.3;
        const zPos = Math.sin(angle) * radius;
        crack.position.set(xPos, yPos, zPos);
        crack.rotation.y = Math.random() * Math.PI;
        crack.rotation.z = Math.random() * Math.PI / 4;
        cracksGroup.add(crack);
    }
    const damageLevel2 = new THREE.Group();
    damageLevel2.visible = false;
    wallGroup.add(damageLevel2);
    for (let i = 0; i < 3; i++) {
        const dent = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0x555555,
                roughness: 0.8,
                metalness: 0.2
            })
        );
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.3 + 0.2;
        dent.position.set(
            Math.cos(angle) * radius,
            Math.random() * 0.6 - 0.3,
            Math.sin(angle) * radius
        );
        dent.scale.set(1, 0.3, 1); 
        damageLevel2.add(dent);
    }
    const combinedGeometry = new THREE.BoxGeometry(size, size, size);
    const combinedMesh = new THREE.Mesh(combinedGeometry, wallMaterial);
    combinedMesh.position.copy(position);
    combinedMesh.position.y = size/2;
    combinedMesh.add(wallGroup);
    type UpdateDamageFunc = (health: number, maxHealth: number) => void;
    combinedMesh.userData['updateDamage'] = function(health: number, maxHealth: number) {
        const damagePercent = 1 - (health / maxHealth);
        if (damagePercent > 0.3) {
            cracksGroup.visible = true;
            if (wall.material instanceof THREE.MeshStandardMaterial) {
                wall.material.color.setRGB(
                    0.48 - damagePercent * 0.1,
                    0.48 - damagePercent * 0.1,
                    0.48 - damagePercent * 0.1
                );
            }
        }
        if (damagePercent > 0.7) {
            damageLevel2.visible = true;
        }
    } as UpdateDamageFunc;
    return combinedMesh;
}

function createTreesGroup(size: number, position: THREE.Vector3): THREE.Mesh {
    const treeGroup = new THREE.Group();
    const treeCount = LOW_DETAIL_MODE ? 2 : 3;
    for (let i = 0; i < treeCount; i++) {
        const trunkHeight = 1.2 + Math.random() * 0.6; 
        const trunkRadius = 0.15 + Math.random() * 0.08; 
        const radialSegments = LOW_DETAIL_MODE ? 6 : 8;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, radialSegments);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5D4037,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        const treeX = (Math.random() - 0.5) * size * 0.6;
        const treeZ = (Math.random() - 0.5) * size * 0.6;
        trunk.position.set(treeX, trunkHeight/2, treeZ);
        treeGroup.add(trunk);
        const levels = LOW_DETAIL_MODE ? 2 : 3; 
        const baseRadius = 0.5 + Math.random() * 0.3; 
        for (let j = 0; j < levels; j++) {
            const levelRadius = baseRadius * (1 - j * 0.2);
            const levelHeight = 0.45 + Math.random() * 0.15; 
            const crownGeometry = new THREE.ConeGeometry(levelRadius, levelHeight, radialSegments);
            const crownMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x2E8B57, 
                roughness: 0.8,
                emissive: 0x0A3A0A,
                emissiveIntensity: 0.2 
            });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.set(treeX, trunkHeight + j * levelHeight * 0.7, treeZ);
            treeGroup.add(crown);
        }
    }
    if (!LOW_DETAIL_MODE) {
        const bushCount = 8;
        for (let i = 0; i < bushCount; i++) {
            const bushGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.15, 4, 3); 
            const bushMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x3A9D23, 
                roughness: 0.9 
            });
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            const bushX = (Math.random() - 0.5) * size * 0.8;
            const bushZ = (Math.random() - 0.5) * size * 0.8;
            bush.position.set(bushX, 0.2, bushZ); 
            treeGroup.add(bush);
        }
    }
    const combinedGeometry = new THREE.BoxGeometry(size, size * 1.5, size);
    const combinedMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x33691E,
        transparent: true,
        opacity: 0 
    });
    const combinedMesh = new THREE.Mesh(combinedGeometry, combinedMaterial);
    combinedMesh.position.copy(position);
    combinedMesh.position.y = size * 0.75; 
    combinedMesh.add(treeGroup);
    return combinedMesh;
}
function createHeadquarters(size: number, position: THREE.Vector3): THREE.Mesh {
    const hqGroup = new THREE.Group();
    const baseGeometry = new THREE.BoxGeometry(size, size * 0.3, size);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xB0BEC5, 
        roughness: 0.7,
        metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, -size * 0.35, 0);
    hqGroup.add(base);
    const radialSegments = LOW_DETAIL_MODE ? 6 : 12;
    const columnGeometry = new THREE.CylinderGeometry(size * 0.2, size * 0.2, size * 0.5, radialSegments);
    const columnMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x607D8B,
        roughness: 0.6,
        metalness: 0.4
    });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.set(0, -size * 0.1, 0);
    hqGroup.add(column);
    const starGeometry = createStarGeometry(size * 0.2, size * 0.4);
    const starMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0xFFD700,
        emissiveIntensity: 0.2
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(0, size * 0.2, 0);
    star.rotation.x = -Math.PI / 2;
    hqGroup.add(star);
    const combinedGeometry = new THREE.BoxGeometry(size, size, size);
    const combinedMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        transparent: true,
        opacity: 0
    });
    const combinedMesh = new THREE.Mesh(combinedGeometry, combinedMaterial);
    combinedMesh.position.copy(position);
    combinedMesh.position.y = size/2;
    combinedMesh.add(hqGroup);
    return combinedMesh;
}

function createStarGeometry(innerRadius: number, outerRadius: number): THREE.BufferGeometry {
    const vertices = [];
    const points = 5;
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
    const indices = [];
    for (let i = 0; i < points * 2 - 1; i++) {
        indices.push(0, i, i + 1);
    }
    indices.push(0, points * 2 - 1, 1);
    geometry.setIndex(indices);
    return geometry;
} 