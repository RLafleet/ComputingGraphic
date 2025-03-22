import { mat4 } from 'gl-matrix';
import { Pentagonal_Hexec_cords, Pentagonal_Hexec_faces } from './mathematica';

class PentagonalHexecontahedron {
	private positionBuffer: WebGLBuffer | null;
	private colorBuffer: WebGLBuffer | null;
	private indexBuffer: WebGLBuffer | null;

	private vertexPosition: number;
	private vertexColor: number;
	private projectionMatrix: WebGLUniformLocation | null;
	private modelViewMatrix: WebGLUniformLocation | null;

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly shaderProgram: WebGLProgram
	) {
		const buffers = this.initBuffers();
		this.positionBuffer = buffers.position;
		this.colorBuffer = buffers.color;
		this.indexBuffer = buffers.indices;

		this.vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
		this.vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor');
		this.projectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
		this.modelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
	}

	render(rotation: number) {
		const gl = this.gl;
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // fieldOfView ? +
		const fieldOfView = (45 * Math.PI) / 180;
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = mat4.create();

		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

		const modelViewMatrix = mat4.create();
		mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -7.0]);

		mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [1, 1, 1]);

		this.setPositionAttribute();
		this.setColorAttribute();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.useProgram(this.shaderProgram);

		gl.uniformMatrix4fv(this.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(this.modelViewMatrix, false, modelViewMatrix);

		const vertexCount = this.getVertexCount();
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}

	private setPositionAttribute() {
		const gl = this.gl;
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.vertexPosition, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(this.vertexPosition);
	}

	private setColorAttribute() {
		const gl = this.gl;
		const numComponents = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.vertexAttribPointer(this.vertexColor, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(this.vertexColor);
	}

	private initBuffers() {
		const positionBuffer = this.initPositionBuffer();
		const colorBuffer = this.initColorBuffer();
		const indexBuffer = this.initIndexBuffer();

		return {
			position: positionBuffer,
			color: colorBuffer,
			indices: indexBuffer,
		};
	}

	private initPositionBuffer() {
		const gl = this.gl;
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		const positions = this.calculateVertices();

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		return positionBuffer;
	}

	private initColorBuffer() {
		const gl = this.gl;
		const colors = this.generateColors();   

		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

		return colorBuffer;
	}

	private initIndexBuffer() {
		const gl = this.gl;
		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		const indices = this.calculateIndices();

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		return indexBuffer;
	}

    private calculateVertices(): number[] {
        const vertices: number[] = [];
        for (let i = 0; i < Pentagonal_Hexec_faces.length; i++) {
            const index = Pentagonal_Hexec_faces[i]!;
            const x = Pentagonal_Hexec_cords[index * 3]!;
            const y = Pentagonal_Hexec_cords[index * 3 + 1]!;
            const z = Pentagonal_Hexec_cords[index * 3 + 2]!;
            vertices.push(x, y, z);
        }
        return vertices;
    }

    private calculateIndices(): number[] {
        const indices: number[] = [];
        const faceCount = Pentagonal_Hexec_faces.length / 5;
        for (let i = 0; i < faceCount; i++) {
            const base = i * 5;
            indices.push(base, base + 1, base + 2);
            indices.push(base, base + 2, base + 3);
            indices.push(base, base + 3, base + 4);
        }
        return indices;
    }
    
    private generateColors(): number[] {
        const colors: number[] = [];
        const faceCount = Pentagonal_Hexec_faces.length / 5;
        for (let i = 0; i < faceCount; i++) {
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();
            const a = 1.0;
            for (let j = 0; j < 5; j++) {
                colors.push(r, g, b, a);
            }
        }
        return colors;
    }

	private getVertexCount(): number {
		return this.calculateIndices().length;
	}
}

export { 
    PentagonalHexecontahedron,
};
