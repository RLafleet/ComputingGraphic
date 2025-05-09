import { mat4, vec3 } from 'gl-matrix';
import { loadTexture } from './loadTexture';

export class Labirint {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private walls: number[][] = []; 
    private wallTypes: number[][] = []; 
    private cellSize = 1.0;
    private positionBuffer!: WebGLBuffer;
    private textureCoordBuffer!: WebGLBuffer;
    private wallTypeBuffer!: WebGLBuffer;
    private floorPositionBuffer!: WebGLBuffer;
    private floorTextureCoordBuffer!: WebGLBuffer;
    private wallTexture: WebGLTexture;
    private floorTexture: WebGLTexture;

    private cameraPosition = vec3.fromValues(0.37, 1.30, 1.10);
    private cameraFront = vec3.fromValues(0.0046110741095617414, 0.99, 0.04278077930212021);
    private cameraUp = vec3.fromValues(0, 0, 1);
    private yaw = -Math.PI / 2;
    private pitch = 0;

    private uWallTypeLoc: WebGLUniformLocation | null;
    private uModelViewMatrixLoc: WebGLUniformLocation | null;
    private uProjectionMatrixLoc: WebGLUniformLocation | null;
    private uSamplerLoc: WebGLUniformLocation | null;

    // выделить отдельно классы
    // как-будто вытянуты по высоте, посмотреть, должно быть более квадратно
    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;
        
        this.generateMaze();
        this.generateWallTypes();
        
        this.initBuffers();
        
        this.wallTexture = loadTexture(gl, './walls.png');
        this.floorTexture = loadTexture(gl, './walls.png'); 
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        this.uWallTypeLoc = gl.getUniformLocation(program, 'uWallType');
        this.uModelViewMatrixLoc = gl.getUniformLocation(program, 'uModelViewMatrix');
        this.uProjectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
        this.uSamplerLoc = gl.getUniformLocation(program, 'uSampler');
        
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        window.addEventListener('click', () => this.lockPointer());
    }
    
    private generateWallTypes() {
        this.wallTypes = this.walls.map(row => Array(row.length).fill(0));
        
        for (let y = 0; y < this.walls.length; y++) {
            for (let x = 0; x < this.walls[y]!.length; x++) {
                if (this.walls[y]![x] === 1) {
                    if (y === 0 || y === this.walls.length - 1 || 
                        x === 0 || x === this.walls[y]!.length - 1) {
                        this.wallTypes[y]![x] = 0;
                    } 
                    else {
                        const hasNorthWall = y > 0 && this.walls[y-1]![x] === 1;
                        const hasSouthWall = y < this.walls.length-1 && this.walls[y+1]![x] === 1;
                        const hasEastWall = x < this.walls[y]!.length-1 && this.walls[y]![x+1] === 1;
                        const hasWestWall = x > 0 && this.walls[y]![x-1] === 1;
                        
                        const verticalCount = (hasNorthWall ? 1 : 0) + (hasSouthWall ? 1 : 0);
                        const horizontalCount = (hasEastWall ? 1 : 0) + (hasWestWall ? 1 : 0);
                        
                        if (verticalCount > 0 && horizontalCount === 0) {
                            this.wallTypes[y]![x] = 1;
                        }
                        else if (horizontalCount > 0 && verticalCount === 0) {
                            this.wallTypes[y]![x] = 2;
                        }
                        else if (verticalCount > 0 && horizontalCount > 0) {
                            this.wallTypes[y]![x] = 3;
                        }
                        else if (verticalCount === 0 && horizontalCount === 0) {
                            this.wallTypes[y]![x] = 4;
                        }
                        else if ((x + y) % 7 === 0) {
                            this.wallTypes[y]![x] = 5;
                        }
                        else {
                            this.wallTypes[y]![x] = (x + y) % 5;
                        }
                    }
                }
            }
        }
    }
    
    private initBuffers() {
        const gl = this.gl;
        const positions: number[] = [];
        const textureCoords: number[] = [];
        const wallTypes: number[] = [];

        for (let y = 0; y < this.walls.length; y++) {
            for (let x = 0; x < (this.walls[y]?.length || 0); x++) {
                if (this.walls?.[y]?.[x] === 1) {
                    const wallType = this.wallTypes[y]![x]!;
                    this.addWall(x, y, positions, textureCoords, wallTypes, wallType);
                }
            }
        }

        this.positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.textureCoordBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

        this.wallTypeBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.wallTypeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallTypes), gl.STATIC_DRAW);

        this.createFloorBuffers();
    }

    private createFloorBuffers() {
        const gl = this.gl;
        
        const mazeWidth = this.walls[0]?.length || 0;
        const mazeHeight = this.walls.length;
        const floorWidth = mazeWidth * this.cellSize;
        const floorDepth = mazeHeight * this.cellSize;
        
        const left = -8;
        const right = left + floorWidth;
        const back = -8;
        const front = back + floorDepth;
        const height = 0;
        
        const floorPositions = [
            left, front, height,
            right, front, height,
            left, back, height,
            
            right, front, height,
            right, back, height,
            left, back, height
        ];
        
        const floorTexCoords = [
            0, 0,
            mazeWidth, 0,
            0, mazeHeight,
            
            mazeWidth, 0,
            mazeWidth, mazeHeight,
            0, mazeHeight
        ];
        
        this.floorPositionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorPositions), gl.STATIC_DRAW);
        
        this.floorTextureCoordBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorTexCoords), gl.STATIC_DRAW);
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

    private lockPointer() {
        const canvas = this.gl.canvas as HTMLCanvasElement;
        canvas.requestPointerLock();
    }

    private handleMouseMove(event: MouseEvent) {
        if (document.pointerLockElement !== this.gl.canvas) return;
    
        const sensitivity = 0.002;
        this.yaw -= event.movementX * sensitivity;
        this.pitch -= event.movementY * sensitivity;
    
        const maxPitch = Math.PI / 2 - 0.1;
        const minPitch = -Math.PI / 2 + 0.1;
        this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch));
    
        this.updateCameraVectors();
        this.render();
    }

    private updateCameraVectors() {
        this.cameraFront[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.cameraFront[1] = Math.cos(this.pitch) * Math.sin(this.yaw);
        this.cameraFront[2] = Math.sin(this.pitch);
        vec3.normalize(this.cameraFront, this.cameraFront);
    }

    public render() {
        const gl = this.gl;
        const program = this.program;

        gl.useProgram(program);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, (45 * Math.PI) / 180, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

        const modelViewMatrix = mat4.create();
        const target = vec3.create();
        vec3.add(target, this.cameraPosition, this.cameraFront);
        mat4.lookAt(modelViewMatrix, this.cameraPosition, target, this.cameraUp);

        this.drawFloor(gl, program, modelViewMatrix, projectionMatrix);

        this.drawWalls(gl, program, modelViewMatrix, projectionMatrix);
    }

    private drawFloor(gl: WebGLRenderingContext, program: WebGLProgram, modelViewMatrix: mat4, projectionMatrix: mat4) {
        gl.uniformMatrix4fv(this.uModelViewMatrixLoc, false, modelViewMatrix);
        gl.uniformMatrix4fv(this.uProjectionMatrixLoc, false, projectionMatrix);
        
        gl.uniform1f(this.uWallTypeLoc, 3.5);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.floorTexture);
        gl.uniform1i(this.uSamplerLoc, 0);

        const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorPositionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        const textureCoordLocation = gl.getAttribLocation(program, 'aTextureCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorTextureCoordBuffer);
        gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(textureCoordLocation);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        gl.disableVertexAttribArray(positionLocation);
        gl.disableVertexAttribArray(textureCoordLocation);
    }

    private drawWalls(gl: WebGLRenderingContext, program: WebGLProgram, modelViewMatrix: mat4, projectionMatrix: mat4) {
        gl.uniformMatrix4fv(this.uModelViewMatrixLoc, false, modelViewMatrix);
        gl.uniformMatrix4fv(this.uProjectionMatrixLoc, false, projectionMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.wallTexture);
        gl.uniform1i(this.uSamplerLoc, 0);

        const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        const textureCoordLocation = gl.getAttribLocation(program, 'aTextureCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(textureCoordLocation);

        const wallTypes: number[] = [];
        for (let y = 0; y < this.walls.length; y++) {
            for (let x = 0; x < (this.walls[y]?.length || 0); x++) {
                if (this.walls?.[y]?.[x] === 1) {
                    wallTypes.push(this.wallTypes[y]![x]!);
                }
            }
        }

        const wallsByType = new Map<number, number[]>();
        
        for (let type = 0; type <= 5; type++) {
            const indices: number[] = [];
            
            for (let i = 0; i < wallTypes.length; i++) {
                if (wallTypes[i] === type) {
                    const startVertex = i * 36;
                    indices.push(startVertex);
                }
            }
            
            if (indices.length > 0) {
                wallsByType.set(type, indices);
            }
        }

        for (const [type, wallIndices] of wallsByType.entries()) {
            gl.uniform1f(this.uWallTypeLoc, type);
            
            for (const startVertex of wallIndices) {
                gl.drawArrays(gl.TRIANGLES, startVertex, 36);
            }
        }
        
        gl.disableVertexAttribArray(positionLocation);
        gl.disableVertexAttribArray(textureCoordLocation);
    }

    private handleKeyDown(event: KeyboardEvent) {
        const speed = 0.1;

        const moveDir = vec3.fromValues(
            Math.cos(this.yaw),
            Math.sin(this.yaw),
            0
        );
        vec3.normalize(moveDir, moveDir);

        const right = vec3.create();
        vec3.cross(right, moveDir, this.cameraUp);
        vec3.normalize(right, right);

        let deltaX = 0;
        let deltaY = 0;

        switch (event.key) {
            case 'ArrowUp': case 'w': case 'W':
                deltaX = moveDir[0] * speed;
                deltaY = moveDir[1] * speed;
                break;
            case 'ArrowDown': case 's': case 'S':
                deltaX = -moveDir[0] * speed;
                deltaY = -moveDir[1] * speed;
                break;
            case 'ArrowLeft': case 'a': case 'A':
                deltaX = -right[0] * speed;
                deltaY = -right[1] * speed;
                break;
            case 'ArrowRight': case 'd': case 'D':
                deltaX = right[0] * speed;
                deltaY = right[1] * speed;
                break;
            default:
                return;
        }

        let newX = this.cameraPosition[0] + deltaX;
        let newY = this.cameraPosition[1];
        if (!this.checkCollision(newX, newY)) {
            this.cameraPosition[0] = newX;
        }

        newX = this.cameraPosition[0];
        newY = this.cameraPosition[1] + deltaY;
        if (!this.checkCollision(newX, newY)) {
            this.cameraPosition[1] = newY;
        }

        this.cameraPosition[2] = 1.10;
        this.render();
    }

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

    private addWall(x: number, y: number, positions: number[], textureCoords: number[], wallTypes: number[], wallType: number) {
        const height = 3.0;
        const left = -8 + x * this.cellSize;
        const right = left + this.cellSize;
        const front = 8 - y * this.cellSize;
        const back = front - this.cellSize;

        const vertices = [
            left, front, 0,
            right, front, 0,
            left, front, height,
            right, front, height,
            left, front, height,
            right, front, 0,

            left, back, 0,
            right, back, 0,
            left, back, height,
            right, back, height,
            left, back, height,
            right, back, 0,

            left, front, height,
            right, front, height,
            left, back, height,
            right, back, height,
            left, back, height,
            right, front, height,

            left, front, 0,
            left, back, 0,
            left, front, height,
            left, back, height,
            left, front, height,
            left, back, 0,

            right, front, 0,
            right, back, 0,
            right, front, height,
            right, back, height,
            right, front, height,
            right, back, 0
        ];

        const frontBackUVs = [
            0, 1,  1, 1,  0, 0,    
            1, 0,  0, 0,  1, 1     
        ];
        
        const topUVs = [
            0, 1,  1, 1,  0, 0,
            1, 0,  0, 0,  1, 1     
        ];
        
        const leftRightUVs = [
            0, 1,  1, 1,  0, 0,    
            1, 0,  0, 0,  1, 1
        ];
        
        textureCoords.push(...frontBackUVs);
        
        textureCoords.push(...frontBackUVs);
        
        textureCoords.push(...topUVs);
        
        textureCoords.push(...leftRightUVs);
        
        textureCoords.push(...leftRightUVs);

        positions.push(...vertices);

        for (let i = 0; i < vertices.length / 3; i++) {
            wallTypes.push(wallType);
        }
    }
}
