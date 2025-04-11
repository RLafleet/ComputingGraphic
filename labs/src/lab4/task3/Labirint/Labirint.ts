import { mat4, vec3 } from 'gl-matrix';
import { loadTexture } from './loadTexture';

// масштаб для текстур лучше
export class Labirint {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private walls: number[][] = [];
    private cellSize = 1.0;
    private positionBuffer!: WebGLBuffer;
    private textureCoordBuffer!: WebGLBuffer; 
    private texture: WebGLTexture;

    private cameraPosition = vec3.fromValues(0.37, 1.30, 1.30);
    private cameraFront = vec3.fromValues(0.0046110741095617414, 0.99, 0.04278077930212021);
    private cameraUp = vec3.fromValues(0, 0, 1);
    private yaw = -Math.PI / 2;
    private pitch = 0;

    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;
        this.generateMaze();
        this.initBuffers();
        this.texture = loadTexture(gl, './walls.png');
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        window.addEventListener('click', () => this.lockPointer());
    }

    private initBuffers() {
        const gl = this.gl;
        const positions: number[] = [];
        const textureCoords: number[] = []; 

        for (let y = 0; y < this.walls.length; y++) {
            for (let x = 0; x < (this.walls[y]?.length || 0); x++) {
                if (this.walls?.[y]?.[x]=== 1) {
                    this.addWall(x, y, positions, textureCoords);
                }
            }
        }

        this.positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.textureCoordBuffer = gl.createBuffer()!; 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
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

        const uProjection = gl.getUniformLocation(program, 'uProjectionMatrix');
        const uModelView = gl.getUniformLocation(program, 'uModelViewMatrix');
        gl.uniformMatrix4fv(uProjection, false, projectionMatrix);
        gl.uniformMatrix4fv(uModelView, false, modelViewMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        const uSampler = gl.getUniformLocation(program, 'uSampler');
        gl.uniform1i(uSampler, 0);

        const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        const textureCoordLocation = gl.getAttribLocation(program, 'aTextureCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(textureCoordLocation);

        const wallCount = this.walls.flat().filter(x => x === 1).length;
        gl.drawArrays(gl.TRIANGLES, 0, wallCount * 36);
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

    private addWall(x: number, y: number, positions: number[], textureCoords: number[]) {
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

        const texCoords = [
            0, 0, 1, 0, 0, 1,
            1, 1, 0, 1, 1, 0,

            0, 0, 1, 0, 0, 1,
            1, 1, 0, 1, 1, 0,

            0, 0, 1, 0, 0, 1,
            1, 1, 0, 1, 1, 0,

            0, 0, 1, 0, 0, 1,
            1, 1, 0, 1, 1, 0,

            0, 0, 1, 0, 0, 1,
            1, 1, 0, 1, 1, 0
        ];

        positions.push(...vertices);
        textureCoords.push(...texCoords);
    }
}
