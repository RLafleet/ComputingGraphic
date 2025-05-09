const mazeVertexShaderSource = `
	attribute vec4 aVertexPosition;
	attribute vec2 aTextureCoord;
	
	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;
	
	varying vec2 vTextureCoord;
	
	void main() {
		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		vTextureCoord = aTextureCoord;
	}
`;

// надо чтобы меньше логики в шейдерах
// Оставить лишь выборку текстуры и освещение
const mazeFragmentShaderSource = `
	precision mediump float;
	
	varying vec2 vTextureCoord;
	
	uniform sampler2D uSampler;
	uniform float uWallType;
	
	vec4 createTextureEffect(vec2 texCoord, float wallType) {
		float col = mod(wallType, 3.0);
		float row = floor(wallType / 3.0);
		
		float offsetX = col / 3.0;
		float offsetY = row / 2.0;
		
		if (wallType < 0.5) { 
			vec2 adjustedCoord = vec2(
				offsetX + (texCoord.x / 3.0),
				offsetY + (texCoord.y / 2.0)
			);
			return texture2D(uSampler, adjustedCoord);
		}
		else if (wallType < 1.5) { 
			vec2 adjustedCoord = vec2(
				offsetX + (mod(texCoord.x * 3.0, 1.0) / 3.0),
				offsetY + (texCoord.y / 2.0)
			);
			return texture2D(uSampler, adjustedCoord);
		}
		else if (wallType < 2.5) { 
			vec2 adjustedCoord = vec2(
				offsetX + (texCoord.x / 3.0),
				offsetY + (mod(texCoord.y * 3.0, 1.0) / 2.0)
			);
			return texture2D(uSampler, adjustedCoord);
		}
		else if (wallType < 3.5) { 
			vec2 adjustedCoord = vec2(
				offsetX + (mod(texCoord.x * 5.0, 1.0) / 3.0),
				offsetY + (mod(texCoord.y * 5.0, 1.0) / 2.0)
			);
			return texture2D(uSampler, adjustedCoord);
		}
		else if (wallType < 4.5) { 
			float diagonal = mod(texCoord.x * 3.0 + texCoord.y * 3.0, 1.0);
			vec2 adjustedCoord = vec2(
				offsetX + (diagonal / 3.0),
				offsetY + (texCoord.y / 2.0)
			);
			return texture2D(uSampler, adjustedCoord);
		}
		else { 
			float dist = length(texCoord - vec2(0.5, 0.5)) * 2.0;
			vec2 adjustedCoord = vec2(
				offsetX + (mod(dist * 3.0, 1.0) / 3.0),
				offsetY + (mod(dist * 3.0, 1.0) / 2.0)
			);
			return texture2D(uSampler, adjustedCoord);
		}
	}
	
	// mip-mapping использовать
	vec4 applyWallEffect(vec4 texColor, float wallType) {
		if (wallType < 0.5) {
			return texColor;
		}
		else if (wallType < 1.5) {
			return texColor * 0.7;
		}
		else if (wallType < 2.5) {
			return vec4(texColor.r * 0.8, texColor.g * 1.2, texColor.b * 0.8, texColor.a);
		}
		else if (wallType < 3.5) {
			return vec4(texColor.r * 1.2, texColor.g * 0.8, texColor.b * 0.8, texColor.a);
		}
		else if (wallType < 4.5) {
			return vec4(texColor.r * 0.8, texColor.g * 0.9, texColor.b * 1.3, texColor.a) * 1.2;
		}
		else if (wallType < 5.5) {
			return vec4(texColor.r * 0.8, texColor.g * 0.8, texColor.b * 1.2, texColor.a);
		}
		else {
			return vec4(texColor.r * 1.2, texColor.g * 1.2, texColor.b * 0.8, texColor.a);
		}
	}
	
	void main() {
		vec4 texColor = createTextureEffect(vTextureCoord, uWallType);
		
		gl_FragColor = applyWallEffect(texColor, uWallType);
	}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) {
		console.error('Unable to create shader');
		return null;
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createShaderProgram(gl: WebGLRenderingContext, vsSource: string = mazeVertexShaderSource, fsSource: string = mazeFragmentShaderSource): WebGLProgram | null {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

	if (!vertexShader || !fragmentShader) {
		return null;
	}

	const shaderProgram = gl.createProgram();
	if (!shaderProgram) {
		console.error('Unable to create shader program');
		return null;
	}
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	return shaderProgram;
}

export { 
	mazeVertexShaderSource, mazeFragmentShaderSource,
	createShaderProgram 
};

// mipmapping использовать 