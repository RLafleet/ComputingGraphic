import { mat4 } from 'gl-matrix';

class PentagonalHexecontahedron {
	private positionBuffer: WebGLBuffer | null;
	private colorBuffer: WebGLBuffer | null;
	private triangleIndexBuffer: WebGLBuffer | null;
	private edgeIndexBuffer: WebGLBuffer | null;
	private triangleIndexCount: number = 0;
	private edgeIndexCount: number = 0;

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
		this.triangleIndexBuffer = buffers.triangleIndices;
		this.edgeIndexBuffer = buffers.edgeIndices;

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

		const fieldOfView = (45 * Math.PI) / 180;
		const aspect = gl.canvas.width / gl.canvas.height;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = mat4.create();

		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

		const modelViewMatrix = mat4.create();
		mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, rotation * 0.7, [0, 1, 0]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, rotation * 0.4, [1, 0, 0]);

		gl.useProgram(this.shaderProgram);
		gl.uniformMatrix4fv(this.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(this.modelViewMatrix, false, modelViewMatrix);

		const type = gl.UNSIGNED_SHORT;
		const offset = 0;

		this.setPositionAttribute();
		this.setColorAttribute();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.drawElements(gl.TRIANGLES, this.triangleIndexCount, type, offset);

		gl.disableVertexAttribArray(this.vertexColor);
		gl.vertexAttrib4f(this.vertexColor, 1.0, 1.0, 1.0, 1.0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
		gl.drawElements(gl.LINES, this.edgeIndexCount, type, offset);
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
		const triangleIndexBuffer = this.initTriangleIndexBuffer();
		const edgeIndexBuffer = this.initEdgeIndexBuffer();

		return {
			position: positionBuffer,
			color: colorBuffer,
			triangleIndices: triangleIndexBuffer,
			edgeIndices: edgeIndexBuffer,
		};
	}

	private initPositionBuffer() {
		const gl = this.gl;
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		const positions = [
			-1.0, -1.0,  1.0,
			 1.0, -1.0,  1.0,
			 1.0,  1.0,  1.0,
			-1.0,  1.0,  1.0,
			-1.0, -1.0, -1.0,
			 1.0, -1.0, -1.0,
			 1.0,  1.0, -1.0,
			-1.0,  1.0, -1.0,
		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		return positionBuffer;
	}

	private initColorBuffer() {
		const gl = this.gl;
		const colors = [
			1.0, 0.0, 0.0, 1.0, 
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0, 
			1.0, 1.0, 0.0, 1.0, 
			1.0, 0.0, 1.0, 1.0, 
			0.0, 1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0, 
			0.5, 0.5, 0.5, 1.0, 
		];

		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

		return colorBuffer;
	}

	private initTriangleIndexBuffer(): WebGLBuffer | null {
		const gl = this.gl;
		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		const indices = [
			0, 1, 2,    0, 2, 3,
			4, 5, 6,    4, 6, 7,
			3, 2, 6,    3, 6, 7,
			0, 1, 5,    0, 5, 4,
			1, 5, 6,    1, 6, 2,
			0, 4, 7,    0, 7, 3,
		];

		this.triangleIndexCount = indices.length;

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		return indexBuffer;
	}

	private initEdgeIndexBuffer(): WebGLBuffer | null {
		const gl = this.gl;
		const edgeBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeBuffer);

		const indices = [
			0, 1,  
			1, 2,  
			2, 3,  
			3, 0,
			4, 5,  
			5, 6,  
			6, 7,  
			7, 4,
			0, 4,  
			1, 5,  
			2, 6, 
			3, 7
		];

		this.edgeIndexCount = indices.length;

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		return edgeBuffer;
	}
}

export {
    PentagonalHexecontahedron,
};
