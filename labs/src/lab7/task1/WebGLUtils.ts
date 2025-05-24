const vertexShaderSource = `
    attribute vec4 aVertexPosition;

    void main(void) {
      float x = aVertexPosition.x;
      float y;
      if (x == 0.0) {
        y = 1.0;
      } else {
        y = sin(x) / x;
      }

      gl_Position = vec4(x / 10.0, (y + 0.25) / 1.25 * 2.0 - 1.0, aVertexPosition.z, 1.0);
    }
`
const fragmentShaderSource = `
    precision mediump float;

    void main(void) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
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