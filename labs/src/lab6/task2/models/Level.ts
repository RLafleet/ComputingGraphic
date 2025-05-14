import * as THREE from 'three';
import { BlockType, createBlock } from './terrain/Block';

export type LevelLayout = BlockType[][];

export class Level {
    private scene: THREE.Scene;
    private layout: LevelLayout;
    private blocks: THREE.Mesh[][] = []; 
    private blockSize: number = 1; 
    private mapWidth: number;
    private mapHeight: number;

    constructor(scene: THREE.Scene, layout: LevelLayout) {
        this.scene = scene;
        this.layout = layout;
        this.mapHeight = layout.length;
        this.mapWidth = layout[0]?.length ?? 0; 
        for (let y = 0; y < this.mapHeight; y++) {
            this.blocks[y] = new Array(this.mapWidth).fill(null); 
        }
        if (this.mapHeight === 0 || this.mapWidth === 0) {
            console.warn("Level layout is empty!");
        }
        this.loadLevel();
    }
    
    private loadLevel(): void {
        if (this.mapHeight === 0 || this.mapWidth === 0) return;
        const offsetX = -(this.mapWidth * this.blockSize) / 2 + this.blockSize / 2;
        const offsetZ = -(this.mapHeight * this.blockSize) / 2 + this.blockSize / 2;
        for (let y = 0; y < this.mapHeight; y++) {
            if (!this.blocks[y]) continue;
            for (let x = 0; x < this.mapWidth; x++) {
                const blockType = this.layout[y]?.[x]; 
                if (blockType === undefined) {
                    console.warn(`Undefined block type at [${y}, ${x}]`);
                    continue; 
                }
                const position = new THREE.Vector3(
                    offsetX + x * this.blockSize,
                    0, 
                    offsetZ + y * this.blockSize
                );
                const blockMesh = createBlock(blockType, position);
                this.scene.add(blockMesh);
                this.blocks[y][x] = blockMesh;
                if (blockType !== BlockType.GROUND) {
                    const groundGeo = new THREE.PlaneGeometry(this.blockSize, this.blockSize);
                    const groundMat = new THREE.MeshStandardMaterial({ color: 0x964B00 }); 
                    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
                    groundMesh.rotation.x = -Math.PI / 2;
                    groundMesh.position.set(position.x, 0, position.z);
                    groundMesh.receiveShadow = true;
                    this.scene.add(groundMesh);
                }
            }
        }
    }
    
    public getBlockAt(gridX: number, gridY: number): THREE.Mesh | null {
        if (gridY >= 0 && gridY < this.mapHeight && gridX >= 0 && gridX < this.mapWidth) {
            const block = this.blocks[gridY]?.[gridX];
            return block ? block : null; 
        }
        return null;
    }

    public getDimensions(): { width: number, height: number } {
        return { width: this.mapWidth, height: this.mapHeight };
    }
} 