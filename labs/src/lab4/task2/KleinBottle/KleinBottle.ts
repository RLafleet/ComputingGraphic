import {mat3, mat4, ReadonlyVec3, vec3} from 'gl-matrix'

class KleinBottle {
	private readonly positionBuffer: WebGLBuffer | null
	private readonly colorBuffer: WebGLBuffer | null
	private readonly edgeBuffer: WebGLBuffer | null
	private readonly indexBuffer: WebGLBuffer | null
	private readonly normalBuffer: WebGLBuffer | null

	private readonly vertexPosition: number
	private readonly vertexColor: number
	private readonly projectionMatrixLocation: WebGLUniformLocation | null
	private readonly modelViewMatrixLocation: WebGLUniformLocation | null
	private readonly normalMatrixLocation: WebGLUniformLocation | null
	private readonly normalLocation: number

	private readonly reverseLightDirection: WebGLUniformLocation | null

	private edgeCount = 0
	private indexCount = 0
	private positions: number[] = []

    private readonly segmentsU = 100;
    private readonly segmentsV = 100;

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly shaderProgram: WebGLProgram,
	) {
		// в какой системе координат выполняется освещение +

		const buffers = this.initBuffers()
		this.positionBuffer = buffers.position
		this.colorBuffer = buffers.color
		this.indexBuffer = buffers.indices
		this.edgeBuffer = buffers.edges
		this.normalBuffer = buffers.normal

		this.vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
		this.vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor')
		this.projectionMatrixLocation = gl.getUniformLocation(
			shaderProgram,
			'uProjectionMatrix',
		)
		this.modelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
		this.normalLocation = gl.getAttribLocation(shaderProgram, 'aNormal')
		this.normalMatrixLocation = gl.getUniformLocation(shaderProgram, 'uNormalMatrix')
		this.reverseLightDirection = gl.getUniformLocation(shaderProgram, 'uReverseLightDirection')
	}

	render(cameraRotationX: number, cameraRotationY: number, lightIntensity: number) {
		const gl = this.gl
		gl.clearColor(0.0, 0.0, 0.0, 0.1) 
		gl.clearDepth(1.0) 
		gl.enable(gl.DEPTH_TEST)
		gl.depthFunc(gl.LEQUAL) 

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		const fieldOfView = (45 * Math.PI) / 180 
		const aspect = gl.canvas.width / gl.canvas.height
		const zNear = 0.001
		const zFar = 300.0
		const projectionMatrix = mat4.create()

		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

		const distance = 40.0
		// вывести эти формулы, нарисовать рисунок
		// разрезать ленту мебиуса вдоль и посмотреть
		const eye: ReadonlyVec3 = [
			distance * Math.cos(cameraRotationX) * Math.sin(cameraRotationY),
			distance * Math.sin(cameraRotationX),
			distance * Math.cos(cameraRotationX) * Math.cos(cameraRotationY),
		]
		console.log('1', 			distance * Math.cos(cameraRotationX) * Math.sin(cameraRotationY),)
		console.log('2', 			distance * Math.sin(cameraRotationX),)
		console.log('3', 			distance * Math.cos(cameraRotationX) * Math.cos(cameraRotationY),)
		const center: ReadonlyVec3 = [0, 0, 0]
		const up: ReadonlyVec3 = [0, 1, 0]

		const modelViewMatrix = mat4.create()
		mat4.lookAt(modelViewMatrix, eye, center, up)

		const normalMatrix = mat3.create()
		mat3.normalFromMat4(normalMatrix, modelViewMatrix)

		this.setPositionAttribute()

		this.setColorAttribute()

		this.setNormalAttribute()

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

		gl.useProgram(this.shaderProgram)

		gl.uniformMatrix3fv(
			this.normalMatrixLocation,
			false,
			normalMatrix,
		)
		gl.uniformMatrix4fv(
			this.projectionMatrixLocation,
			false,
			projectionMatrix,
		)
		gl.uniformMatrix4fv(
			this.modelViewMatrixLocation,
			false,
			modelViewMatrix,
		)

		const lightDir = vec3.fromValues(-1, 1, 1)
		vec3.normalize(lightDir, lightDir)
		vec3.scale(lightDir, lightDir, lightIntensity)
		gl.uniform3fv(this.reverseLightDirection, lightDir)

		{
			const vertexCount = this.indexCount
			// выяснить что задает параметр type + 
			const type = gl.UNSIGNED_SHORT
			// offset для чего + 
			const offset = 0
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
		}

		{
			gl.disableVertexAttribArray(this.vertexColor)
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeBuffer)
			gl.drawElements(gl.LINES, this.edgeCount, gl.UNSIGNED_SHORT, 0)
		}
	}

	private setPositionAttribute() {
		const gl = this.gl
		const numComponents = 3
		const type = gl.FLOAT 
		const normalize = false 
		const stride = 0

		const offset = 0 
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
		gl.vertexAttribPointer(
			this.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(this.vertexPosition)
	}

	private setColorAttribute() {
		const gl = this.gl
		const numComponents = 4
		const type = gl.FLOAT
		const normalize = false
		const stride = 0
		const offset = 0
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.vertexAttribPointer(
			this.vertexColor,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(this.vertexColor)
	}

	private setNormalAttribute() {
		const gl = this.gl
		const numComponents = 3
		const type = gl.FLOAT 
		const normalize = false 
		const stride = 0 
		const offset = 0 
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
		gl.vertexAttribPointer(
			this.normalLocation,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		)
		gl.enableVertexAttribArray(this.normalLocation)
	}

	private initBuffers() {
		const positionBuffer = this.initPositionBuffer()
		const colorBuffer = this.initColorBuffer()
		const indexBuffer = this.initIndexBuffer()
		const edgeBuffer = this.initEdgeBuffer()
		const normal = this.initNormalBuffer()

		return {
			position: positionBuffer,
			color: colorBuffer,
			indices: indexBuffer,
			edges: edgeBuffer,
			normal: normal,
		}
	}

	private initPositionBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const positionBuffer = gl.createBuffer()

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

		const positions = this.getPositions()
		this.positions = positions.slice()

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

		return positionBuffer
	}

	private initColorBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const numVertices = this.positions.length / 3
		const colors: number[] = []
		for (let i = 0; i < numVertices; i++) {
			colors.push(0.8, 0.3, 0, 1.0)
		}
		const colorBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

		return colorBuffer
	}

	// для чего именно +
	private initEdgeBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const edgeIndices: number[] = []
		const lineFaces = this.getLineFaces()
		lineFaces.forEach(item => {
			if (item.length === 2) {
				edgeIndices.push(...item)
			}
		})

		const edgeBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeBuffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(edgeIndices), gl.STATIC_DRAW)
		this.edgeCount = edgeIndices.length
		return edgeBuffer
	}

	// какие ещё есть примитивы кроме треугольников +
	// - gl.POINTS
	// - gl.LINES
	// - gl.TRIANGLES
	// - gl.TRIANGLE_STRIP
	// - gl.TRIANGLE_FAN
	private initIndexBuffer(): WebGLBuffer | null {
		const gl = this.gl

		const indexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

		const triangleFaces = this.getTriangleFaces()
		const indices: number[] = []
		for (const face of triangleFaces) {
			if (face.length === 3) {
				indices.push(...face)
			}
		}

		this.indexCount = indices.length
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
		return indexBuffer
	}

	private initNormalBuffer(): WebGLBuffer | null {
		const gl = this.gl
		const normals = this.computeNormals()
		const normalBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
		return normalBuffer
	}

	private computeNormals(): number[] {
		const normals: number[] = [];
		const uMin = 0;
		const uMax = 2 * Math.PI;
		const vMin = 0;
		const vMax = 2 * Math.PI;
		const r = 1; 
		const scale = 0.8;

		for (let i = 0; i <= this.segmentsU; i++) {
			const u = uMin + ((uMax - uMin) * i) / this.segmentsU;
			const cosU = Math.cos(u);
			const sinU = Math.sin(u);
			const term = 4 * r * (1 - cosU / 2);
			const dTermDu = 2 * r * sinU;

			for (let j = 0; j <= this.segmentsV; j++) {
				const v = vMin + ((vMax - vMin) * j) / this.segmentsV;
				const cosV = Math.cos(v);
				const sinV = Math.sin(v);

				let dx_du, dy_du, dz_du;
				let dx_dv, dy_dv, dz_dv;

				if (u <= Math.PI) {
					dx_du = (-6 * sinU * (1 + sinU) + 6 * cosU * cosU 
							+ (dTermDu * cosU * cosV - term * sinU * cosV)) * scale;
					dy_du = (16 * cosU + (dTermDu * sinU * cosV + term * cosU * cosV)) * scale;
					dz_du = dTermDu * sinV * scale;
					
					dx_dv = -term * cosU * sinV * scale;
					dy_dv = -term * sinU * sinV * scale;
					dz_dv = term * cosV * scale;
				} else {
					dx_du = (-6 * sinU * (1 + sinU) + 6 * cosU * cosU - dTermDu * cosV) * scale;
					dy_du = 16 * cosU * scale;
					dz_du = dTermDu * sinV * scale;

					dx_dv = term * sinV * scale;
					dy_dv = 0;
					dz_dv = term * cosV * scale;
				}
	
				const du = vec3.fromValues(dx_du, dy_du, dz_du);
				const dvVec = vec3.fromValues(dx_dv, dy_dv, dz_dv);
				const normal = vec3.cross(vec3.create(), du, dvVec);
				vec3.normalize(normal, normal);
				normals.push(...normal);
			}
		}
		return normals;
	}

	private getPositions(): number[] {
		const positions: number[] = [];
		const uMin = 0;
		const uMax = 2 * Math.PI;
		const vMin = 0;
		const vMax = 2 * Math.PI;
		const r = 1; 
		const scale = 0.8;

		for (let i = 0; i <= this.segmentsU; i++) {
			const u = uMin + ((uMax - uMin) * i) / this.segmentsU;
			const cosU = Math.cos(u);
			const sinU = Math.sin(u);
			const term = 4 * r * (1 - cosU / 2);

			for (let j = 0; j <= this.segmentsV; j++) {
				const v = vMin + ((vMax - vMin) * j) / this.segmentsV;
				const cosV = Math.cos(v);
				const sinV = Math.sin(v);

				let x, y, z;

				if (u <= Math.PI) {
					x = 6 * cosU * (1 + sinU) + term * cosU * cosV * scale;
					y = 16 * sinU + term * sinU * cosV * scale;
					z = term * sinV * scale;
				} else {
					x = 6 * cosU * (1 + sinU) - term * cosV * scale;
					y = 16 * sinU;
					z = term * sinV * scale;
				}

				positions.push(x, y, z);
			}
		}
		return positions;
	}

	private getTriangleFaces(): number[][] {
		const faces: number[][] = [];
		for (let i = 0; i < this.segmentsU; i++) {
			for (let j = 0; j < this.segmentsV; j++) {
				const idx1 = i * (this.segmentsV + 1) + j;
				const idx2 = (i + 1) * (this.segmentsV + 1) + j;
				const idx3 = i * (this.segmentsV + 1) + (j + 1);
				const idx4 = (i + 1) * (this.segmentsV + 1) + (j + 1);
	
				faces.push([idx1, idx2, idx3]);
				faces.push([idx3, idx2, idx4]);
			}
		}
		return faces;
	}

	private getLineFaces(): number[][] {
		const lines: number[][] = []
		for (let i = 0; i <= this.segmentsU; i++) {
			for (let j = 0; j < this.segmentsV; j++) {
				const idx1 = i * (this.segmentsV + 1) + j
				const idx2 = i * (this.segmentsV + 1) + (j + 1)
				lines.push([idx1, idx2])
			}
		}
		for (let j = 0; j <= this.segmentsV; j++) {
			for (let i = 0; i < this.segmentsU; i++) {
				const idx1 = i * (this.segmentsV + 1) + j
				const idx2 = (i + 1) * (this.segmentsV + 1) + j
				lines.push([idx1, idx2])
			}
		}
		return lines
	}
}

export {
	KleinBottle,
}