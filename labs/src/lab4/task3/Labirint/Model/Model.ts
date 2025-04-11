import { vec3 } from 'gl-matrix';

class LabirintModel {
    private walls: number[][] = [];
    private cellSize = 1.0;
    private cameraPosition = vec3.fromValues(0.37, 1.30, 1.30);
    private cameraFront = vec3.fromValues(0.0046, 0.99, 0.0427);
    private cameraUp = vec3.fromValues(0, 0, 1);
    private yaw = -Math.PI / 2;
    private pitch = 0;

    private generateMaze() {
        this.walls = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }

    private checkCollision(x: number, y: number): boolean {
        const cameraRadius = 0.2;
        const minX = x - cameraRadius;
        const maxX = x + cameraRadius;
        const minY = y - cameraRadius;
        const maxY = y + cameraRadius;

        const minXIndex = Math.floor((minX + 8) / this.cellSize); 
        const maxXIndex = Math.floor((maxX + 8) / this.cellSize);
        const minYIndex = Math.floor((8 - maxY) / this.cellSize); 
        const maxYIndex = Math.floor((8 - minY) / this.cellSize);

        for (let xi = minXIndex; xi <= maxXIndex; xi++) {
            for (let yi = minYIndex; yi <= maxYIndex; yi++) {
                if (xi < 0 || xi >= (this.walls[0]?.length || 0) || yi < 0 || yi >= this.walls.length) {
                    return true;
                }
                if (this.walls?.[yi]?.[xi] === 1) {
                    const wallLeft = -8 + xi * this.cellSize;
                    const wallRight = wallLeft + this.cellSize;
                    const wallFront = 8 - yi * this.cellSize;
                    const wallBack = wallFront - this.cellSize;

                    const overlapX = minX < wallRight && maxX > wallLeft;
                    const overlapY = minY < wallFront && maxY > wallBack;
                    if (overlapX && overlapY) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private updateCameraVectors() {
        this.cameraFront[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.cameraFront[1] = Math.cos(this.pitch) * Math.sin(this.yaw);
        this.cameraFront[2] = Math.sin(this.pitch);
        vec3.normalize(this.cameraFront, this.cameraFront);
    }
}