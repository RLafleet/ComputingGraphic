const vertexShaderSource = `
	attribute vec3 aVertexPosition;
	attribute vec4 aVertexColor;

	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;

	varying lowp vec4 vColor;
	varying lowp vec3 vNormal;

	void main() {
		gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
		vColor = aVertexColor;
		vNormal = vec3(0.0, 1.0, 0.0);
	}
`

const fragmentShaderSource = `
	varying lowp vec4 vColor;
	varying lowp vec3 vNormal;

	void main() {
		lowp vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
		lowp float diff = max(dot(vNormal, lightDir), 0.2);
		gl_FragColor = vColor * vec4(vec3(diff), 1.0);
	}
`

const compileShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
	const shader = gl.createShader(type)
	if (!shader) {
		throw new Error('Не удалось создать шейдер')
	}
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const err = gl.getShaderInfoLog(shader)
		gl.deleteShader(shader)
		throw new Error('Ошибка компиляции шейдера: ' + err)
	}
	return shader
}

const createShaderProgram = (gl: WebGLRenderingContext): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

	const program = gl.createProgram()
	if (!program) {
		throw new Error('Не удалось создать программу')
	}
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const err = gl.getProgramInfoLog(program)
		throw new Error('Ошибка линковки программы: ' + err)
	}
	return program
}

export {
	createShaderProgram,
}