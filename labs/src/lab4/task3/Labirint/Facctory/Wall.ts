import { mat4 } from 'gl-matrix';
import { loadTexture } from '../loadTexture';
import { IWall } from './IWall';

export class Wall implements IWall {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private positionBuffer: WebGLBuffer;
    private textureCoordBuffer: WebGLBuffer;
    private texture: WebGLTexture;
    private walls: number[][];
    private cellSize: number;

    constructor(gl: WebGLRenderingContext, program: WebGLProgram, walls: number[][], cellSize: number) {
        this.gl = gl;
        this.program = program;
        this.walls = walls;
        this.cellSize = cellSize;
        this.positionBuffer = gl.createBuffer()!;
        this.textureCoordBuffer = gl.createBuffer()!;
        this.texture = loadTexture(gl, './walls.png');
        this.initBuffers();
    }

    private initBuffers() {
        const gl = this.gl;
        const positions: number[] = [];
        const textureCoords: number[] = [];

        for (let y = 0; y < this.walls.length; y++) {
            for (let x = 0; x < (this.walls[y]?.length || 0); x++) {
                if (this.walls?.[y]?.[x] === 1) {
                    this.addWall(x, y, positions, textureCoords);
                }
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
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

    public render(projectionMatrix: mat4, modelViewMatrix: mat4) {
        const gl = this.gl;
        const program = this.program;

        gl.useProgram(program);

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
}