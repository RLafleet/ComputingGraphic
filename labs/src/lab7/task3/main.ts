import './index.css'; // Ensure CSS is bundled
import { vertexShaderSource, fragmentShaderSource } from './shaders';

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Unable to create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const errorMsg = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compilation failed: ${errorMsg}`);
    }
    return shader;
}

function createShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) throw new Error('Unable to create shader program');
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error(`Shader program linking failed: ${gl.getProgramInfoLog(shaderProgram)}`);
    }
    return shaderProgram;
}

function main() {
    const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error("Unable to initialize WebGL.");
        return;
    }

    let shaderProgram: WebGLProgram;
    try {
        shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    } catch (e) {
        console.error((e as Error).message);
        return;
    }

    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    const textureCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    
    const uTimeLocation = gl.getUniformLocation(shaderProgram, "uTime");
    const uResolutionLocation = gl.getUniformLocation(shaderProgram, "uResolution");
    const uRippleOriginLocation = gl.getUniformLocation(shaderProgram, "uRippleOrigin");
    // Texture sampler uniforms (not strictly needed for procedural, but good to have if switching to textures)
    // const uTexture1Location = gl.getUniformLocation(shaderProgram, "uTexture1"); 
    // const uTexture2Location = gl.getUniformLocation(shaderProgram, "uTexture2");

    if (!uTimeLocation || !uResolutionLocation || !uRippleOriginLocation) {
        console.error("Failed to get uniform locations. Check shader source and uniform names.");
        return;
    }

    // Full-screen quad
    const positions = [-1, 1, -1, -1, 1, 1, 1, -1];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordinates = [0, 1, 0, 0, 1, 1, 1, 0]; // Standard UVs for the quad
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(textureCoordAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Ripple starts from the center of the canvas
    const rippleOrigin = [0.5, 0.5]; 

    let startTime = Date.now();

    function render() {
        if (!gl) {
            console.error("WebGL context lost or not available in render loop");
            return;
        }
        if (!uTimeLocation || !uResolutionLocation || !uRippleOriginLocation) {
             console.error("Uniform locations became invalid.");
             return;
        }

        const currentTime = (Date.now() - startTime) / 1000.0;

        const canvasWidth = gl.canvas.width as number;
        const canvasHeight = gl.canvas.height as number;

        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(shaderProgram);

        const rX: number = rippleOrigin[0];
        const rY: number = rippleOrigin[1];

        gl.uniform1f(uTimeLocation, currentTime);
        gl.uniform2f(uResolutionLocation, canvasWidth, canvasHeight);
        gl.uniform2f(uRippleOriginLocation, rX, rY);

        // If using actual textures, you would bind them here, e.g.:
        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, texture1);
        // gl.uniform1i(uTexture1Location, 0);
        // gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(gl.TEXTURE_2D, texture2);
        // gl.uniform1i(uTexture2Location, 1);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    // Handle canvas resizing
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        if (gl) {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial size

    requestAnimationFrame(render);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
} 