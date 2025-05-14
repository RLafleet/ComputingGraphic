import { LevelLayout } from '../models/Level';
import { BlockType } from '../models/terrain/Block';
import { FIELD_SIZE } from '../constants/GameConstants';

export class LevelGenerator {
    public static createDefaultLevel(): LevelLayout {
        return Array(FIELD_SIZE).fill(null).map((_, y) => 
            Array(FIELD_SIZE).fill(null).map((_, x) => {
                if (x === 0 || x === FIELD_SIZE - 1 || y === 0 || y === FIELD_SIZE - 1) {
                    return BlockType.STEEL;
                } else {
                    return BlockType.GROUND;
                }
            })
        );
    }

    public static createRandomLevel(): LevelLayout {
        const layout: LevelLayout = Array(FIELD_SIZE).fill(null).map(() => Array(FIELD_SIZE).fill(BlockType.GROUND));

        for (let y = 0; y < FIELD_SIZE; y++) {
            if (!layout[y]) {
                layout[y] = Array(FIELD_SIZE).fill(BlockType.GROUND);
            }
        }

        for (let i = 0; i < FIELD_SIZE; i++) {
            const row0 = layout[0];
            if (row0) row0[i] = BlockType.STEEL;
            
            const rowLast = layout[FIELD_SIZE - 1];
            if (rowLast) rowLast[i] = BlockType.STEEL;
            
            const currentRow = layout[i];
            if (currentRow) {
                currentRow[0] = BlockType.STEEL;
                currentRow[FIELD_SIZE - 1] = BlockType.STEEL;
            }
        }

        this.createRooms(layout);
        this.createWaterBodies(layout);
        this.createForests(layout);

        const hqX = Math.floor(FIELD_SIZE / 2);
        const hqY = FIELD_SIZE - 5; 
        if (layout[hqY]) { 
            layout[hqY][hqX] = BlockType.HQ;
        }
        
        this.clearArea(layout, hqX, hqY, 2);

        this.clearArea(layout, Math.floor(FIELD_SIZE / 2), Math.floor(FIELD_SIZE * 0.25), 4);

        for (let i = 0; i < 3; i++) {
            const spawnX = Math.floor(FIELD_SIZE / 4) + Math.floor(Math.random() * FIELD_SIZE / 2);
            const spawnY = Math.floor(FIELD_SIZE / 5) + Math.floor(Math.random() * FIELD_SIZE / 5);
            this.clearArea(layout, spawnX, spawnY, 2);
        }

        return layout;
    }

    private static createRooms(layout: LevelLayout): void {
        const roomCount = 4 + Math.floor(Math.random() * 3); 
        
        for (let i = 0; i < roomCount; i++) {
            const roomWidth = 4 + Math.floor(Math.random() * 4); 
            const roomHeight = 4 + Math.floor(Math.random() * 4); 
            
            const startX = 3 + Math.floor(Math.random() * (FIELD_SIZE - roomWidth - 6));
            const startY = 3 + Math.floor(Math.random() * (FIELD_SIZE - roomHeight - 6));
            
            const wallType = Math.random() < 0.7 ? BlockType.BRICK : BlockType.STEEL;
            
            for (let y = startY; y < startY + roomHeight; y++) {
                const currentRow = layout[y];
                if (!currentRow) continue; 
                
                for (let x = startX; x < startX + roomWidth; x++) {
                    if (x < 0 || x >= FIELD_SIZE || y < 0 || y >= FIELD_SIZE) continue; 
                    if (y === startY || y === startY + roomHeight - 1 || 
                        x === startX || x === startX + roomWidth - 1) {
                        currentRow[x] = wallType; 
                    }
                }
            }
            
            const doorCount = 1 + Math.floor(Math.random() * 2); 
            for (let d = 0; d < doorCount; d++) {
                const doorSide = Math.floor(Math.random() * 4); 
                let doorX: number | undefined, doorY: number | undefined;
                
                switch (doorSide) {
                    case 0: 
                        doorX = startX + 1 + Math.floor(Math.random() * (roomWidth - 2));
                        doorY = startY;
                        break;
                    case 1: 
                        doorX = startX + roomWidth - 1;
                        doorY = startY + 1 + Math.floor(Math.random() * (roomHeight - 2));
                        break;
                    case 2: 
                        doorX = startX + 1 + Math.floor(Math.random() * (roomWidth - 2));
                        doorY = startY + roomHeight - 1;
                        break;
                    case 3: 
                        doorX = startX;
                        doorY = startY + 1 + Math.floor(Math.random() * (roomHeight - 2));
                        break;
                }
                
                if (doorY !== undefined && doorX !== undefined && 
                    doorY >= 0 && doorY < FIELD_SIZE && doorX >= 0 && doorX < FIELD_SIZE) {
                    const doorRow = layout[doorY];
                    if (doorRow) { 
                        doorRow[doorX] = BlockType.GROUND;
                    }
                }
            }
        }
    }

    private static createWaterBodies(layout: LevelLayout): void {
        const waterCount = 2 + Math.floor(Math.random() * 3); 
        
        for (let i = 0; i < waterCount; i++) {
            const waterWidth = 3 + Math.floor(Math.random() * 5); 
            const waterHeight = 2 + Math.floor(Math.random() * 3); 
            
            const startX = 2 + Math.floor(Math.random() * (FIELD_SIZE - waterWidth - 4));
            const startY = 2 + Math.floor(Math.random() * (FIELD_SIZE - waterHeight - 4));
            
            let canPlace = true;
            for (let y = startY; y < startY + waterHeight; y++) {
                const currentRow = layout[y];
                if (y < 0 || y >= FIELD_SIZE || !currentRow) { 
                    canPlace = false;
                    break;
                }
                
                for (let x = startX; x < startX + waterWidth; x++) {
                    if (x < 0 || x >= FIELD_SIZE) { 
                        canPlace = false;
                        break;
                    }
                    if (currentRow[x] !== BlockType.GROUND) {
                        canPlace = false;
                        break;
                    }
                }
                if (!canPlace) break;
            }
            
            if (canPlace) {
                for (let y = startY; y < startY + waterHeight; y++) {
                    const currentRow = layout[y];
                    if (y < 0 || y >= FIELD_SIZE || !currentRow) continue;
                    
                    for (let x = startX; x < startX + waterWidth; x++) {
                        if (x < 0 || x >= FIELD_SIZE) continue;
                        currentRow[x] = BlockType.WATER;
                    }
                }
            }
        }
    }

    private static createForests(layout: LevelLayout): void {
        const forestCount = 3 + Math.floor(Math.random() * 4); 
        
        for (let i = 0; i < forestCount; i++) {
            const forestWidth = 3 + Math.floor(Math.random() * 4); 
            const forestHeight = 3 + Math.floor(Math.random() * 4); 
            
            const startX = 2 + Math.floor(Math.random() * (FIELD_SIZE - forestWidth - 4));
            const startY = 2 + Math.floor(Math.random() * (FIELD_SIZE - forestHeight - 4));
            
            for (let y = startY; y < startY + forestHeight; y++) {
                const currentRow = layout[y];
                if (y < 0 || y >= FIELD_SIZE || !currentRow) continue; 
                
                for (let x = startX; x < startX + forestWidth; x++) {
                    if (x < 0 || x >= FIELD_SIZE) continue; 
                    
                    if (Math.random() < 0.7 && currentRow[x] === BlockType.GROUND) {
                        currentRow[x] = BlockType.TREES;
                    }
                }
            }
        }
    }

    private static clearArea(layout: LevelLayout, centerX: number, centerY: number, radius: number): void {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            const currentRow = layout[y];
            if (y < 0 || y >= FIELD_SIZE || !currentRow) continue; 
            
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (x < 0 || x >= FIELD_SIZE) continue; 
                
                if (x === 0 || x === FIELD_SIZE - 1 || y === 0 || y === FIELD_SIZE - 1) continue; 
                
                currentRow[x] = BlockType.GROUND;
            }
        }
    }
} 