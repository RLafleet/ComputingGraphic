import { mat4, vec3 } from 'gl-matrix';

export class Labirint {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private walls: number[][] = [];
    private cellSize = 1.0;
    private positionBuffer: WebGLBuffer;
    private colorBuffer: WebGLBuffer;

    private cameraPosition = vec3.fromValues(0.37, 1.30, 1.30);
    private cameraFront = vec3.fromValues(0.0046110741095617414, 0.99, 0.04278077930212021);
    private cameraUp = vec3.fromValues(0, 0, 1);
    private yaw = -Math.PI / 2;
    private pitch = 0;

    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;
        this.generateMaze(10, 10);
        this.initBuffers();

        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        window.addEventListener('click', () => this.lockPointer());
    }

    private generateMaze(width: number, height: number) {
        this.walls = [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,1,1],
            [1,0,0,0,0,0,1,0,0,1],
            [1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,0,0,1,0,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ];
    }

    private initBuffers() {
        const gl = this.gl;
        const positions: number[] = [];
        const colors: number[] = [];

        for (let y = 0; y < this.walls.length; y++) {
            for (let x = 0; x < this.walls[y].length; x++) {
                if (this.walls[y][x] === 1) {
                    this.addWall(x, y, positions, colors);
                }
            }
        }

        this.positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.colorBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    }

    private addWall(x: number, y: number, positions: number[], colors: number[]) {
        const height = 3.0;
        const left = -5 + x * this.cellSize;
        const right = left + this.cellSize;
        const front = 5 - y * this.cellSize;
        const back = front - this.cellSize;

        const vertices = [
            // Передняя грань
            left, front, 0,
            right, front, 0,
            left, front, height,
            right, front, height,
            left, front, height,
            right, front, 0,

            // Задняя грань
            left, back, 0,
            right, back, 0,
            left, back, height,
            right, back, height,
            left, back, height,
            right, back, 0,

            // Верхняя грань
            left, front, height,
            right, front, height,
            left, back, height,
            right, back, height,
            left, back, height,
            right, front, height,

            // Боковые грани
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

        for (let i = 0; i < 36; i++) {
            colors.push(0.8, 0.8, 0.8, 1.0);
        }

        positions.push(...vertices);
    }

    private checkCollision(x: number, y: number): boolean {
        const cameraRadius = 0.2;
        const minX = x - cameraRadius;
        const maxX = x + cameraRadius;
        const minY = y - cameraRadius;
        const maxY = y + cameraRadius;

        const minXIndex = Math.floor((minX + 5) / this.cellSize);
        const maxXIndex = Math.floor((maxX + 5) / this.cellSize);
        const minYIndex = Math.floor((5 - maxY) / this.cellSize);
        const maxYIndex = Math.floor((5 - minY) / this.cellSize);

        for (let xi = minXIndex; xi <= maxXIndex; xi++) {
            for (let yi = minYIndex; yi <= maxYIndex; yi++) {
                if (xi < 0 || xi >= this.walls[0].length || yi < 0 || yi >= this.walls.length) {
                    return true;
                }
                if (this.walls[yi][xi] === 1) {
                    const wallLeft = -5 + xi * this.cellSize;
                    const wallRight = wallLeft + this.cellSize;
                    const wallFront = 5 - yi * this.cellSize;
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

        this.updateCameraVectors();
        this.render();
    }

    private updateCameraVectors() {
        this.cameraFront[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.cameraFront[1] = Math.cos(this.pitch) * Math.sin(this.yaw);
        this.cameraFront[2] = Math.sin(this.pitch);
        vec3.normalize(this.cameraFront, this.cameraFront);
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

    public render() {
        const gl = this.gl;
        const program = this.program;

        gl.useProgram(program);
        gl.enable(gl.DEPTH_TEST);

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

        const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        const wallCount = this.walls.flat().filter(x => x === 1).length;
        const colorLocation = gl.getAttribLocation(program, 'aVertexColor');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLocation);

        gl.drawArrays(gl.TRIANGLES, 0, wallCount * 36);
    }
}