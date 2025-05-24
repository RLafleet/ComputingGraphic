import './index.css'; 
import { createShaderProgram } from './WebGLUtils';

function main() {
    const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Unable to find canvas element. Make sure your index.html has a <canvas id='glcanvas'> element.");
        return;
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    let shaderProgram: WebGLProgram;
    try {
        shaderProgram = createShaderProgram(gl);
    } catch (e) {
        console.error("Error creating shader program:", (e as Error).message);
        return;
    }

    const vertexCount = 200; 
    const xMin = -10.0;
    const xMax = 10.0;
    const deltaX = (xMax - xMin) / (vertexCount - 1);

    const positions: number[] = [];
    for (let i = 0; i < vertexCount; i++) {
        const x = xMin + i * deltaX;
        positions.push(x, 0, 0);
    }

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
        console.error("Failed to create the buffer object for positions");
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    if (positionAttributeLocation < 0) {
        console.error("Failed to get the storage location of aVertexPosition. Check if it's used in the shader.");
        return;
    }

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation,
        3,        
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.drawArrays(gl.LINE_STRIP, 0, vertexCount);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
} 