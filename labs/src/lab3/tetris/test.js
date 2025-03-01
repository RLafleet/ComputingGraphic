var gridPos = [];
/* gridPos
 [
    [[x1,y1],[x2,y2]],
    [[x3,y3],[x4,y4]],
 ]
*/
for (i = 0; i < 20; i++) {
    var row = [];
    for (j = 0; j < 10; j++) {
        row.push([-1.2 + 0.24 * j, 2.4 - 0.24 * i]);
    }
    gridPos.push(row);
}

var gridColors = [];

function initGridColors() {
    gridColors = [];
    for (i = 0; i < 20; i++) {
        var row = [];
        for (j = 0; j < 10; j++) {
            row.push(0);
        }
        gridColors.push(row);
    }
}

initGridColors();

var gridPosArray = [];
for (i = 0; i < 20; i++) {
    for (j = 0; j < 10; j++) {
        var tempPos = gridPos[i][j];
        gridPosArray.push(tempPos[0]);
        gridPosArray.push(tempPos[1]);
        gridPosArray.push(tempPos[0] + 0.24);
        gridPosArray.push(tempPos[1]);
        gridPosArray.push(tempPos[0]);
        gridPosArray.push(tempPos[1] - 0.24);
        gridPosArray.push(tempPos[0] + 0.24);
        gridPosArray.push(tempPos[1] - 0.24);
    }
}
for (i = 0; i < 20; i++) {
    for (j = 0; j < 10; j++) {
        var tempPos = gridPos[i][j];
        gridPosArray.push(tempPos[0]);
        gridPosArray.push(tempPos[1]);
        gridPosArray.push(tempPos[0] + 0.24);
        gridPosArray.push(tempPos[1]);
        gridPosArray.push(tempPos[0] + 0.24);
        gridPosArray.push(tempPos[1] - 0.24);
        gridPosArray.push(tempPos[0]);
        gridPosArray.push(tempPos[1] - 0.24);
    }
}

var gridColorsArray = [];

updateColorsArray();

function updateColorsArray() {
    gridColorsArray = [];
    for (i = 0; i < 20; i++) {
        for (j = 0; j < 10; j++) {
            var temp_color = gridColors[i][j];
            for (k = 0; k < 4; k++) {
                for (p = 0; p < 4; p++) {
                    gridColorsArray.push(colorMap[temp_color][p]);
                }
            }
        }
    }
    for (i = 0; i < 3200; i++) {
        gridColorsArray.push(0.41);
    }
}

function updateColor() {
    for (i = 0; i < newBlock.length; i++) {
        gridColors[newBlock[i][0]][newBlock[i][1]] = blockColor;
    }
}

function eraseColor() {
    for (i = 0; i < newBlock.length; i++) {
        gridColors[newBlock[i][0]][newBlock[i][1]] = 0;
    }
}

var fpcount = 0;
var restart = 0;
var newBlock = [];
var newBlockDir = [];
var blockType;
var blockOffset;
var blockColor;
var block_positions = [];
const PRODUCENEW = "PRODUCENEW";
const FALLDOWN = "FALLDOWN";
const COLLISION = "COLLISION";
const OVER = "OVER";
var state = PRODUCENEW;

keyEventListener();

function collisionCheck() {
    for (i = 0; i < newBlock.length; i++) {
        var downpos = [newBlock[i][0] + 1, newBlock[i][1]];
        if (downpos[0] >= 20)
            return true;
        if (newBlock.indexOf(downpos) == -1 && gridColors[downpos[0]][downpos[1]] != 0)
            return true;
    }
    return false;
}

function endCollisionCheck() {
    for (i = 0; i < newBlock.length; i++) {
        if (gridColors[newBlock[i][0]][newBlock[i][1]] != 0)
            return true;
    }
    return false;
}

function fullRowCheck() {
    var tempGridColors = [];
    for (i = 0; i < 20; i++) {
        var flag = false;
        var row = [];
        for (j = 0; j < 10; j++) {
            row.push(gridColors[i][j]);
            if (gridColors[i][j] == 0) {
                flag = true;
            }
        }
        if (flag)
            tempGridColors.push(row);
    }
    fl = 20 - tempGridColors.length;
    if (fl > 0) {
        var tempFlColors = [];
        for (i = 0; i < fl; i++) {
            var row = [];
            for (j = 0; j < 10; j++)
                row.push(0);
            tempFlColors.push(row);
        }
        tempGridColors = tempFlColors.concat(tempGridColors);
    }
    gridColors = tempGridColors;
}

//periodically invoke
function moveDown() {
    if (fpcount != 8 || collisionCheck())
        return;
    for (i = 0; i < newBlock.length; i++) {
        newBlock[i][0]++;
    }
}

function moveDownF() {
    if (collisionCheck())
        return;
    for (i = 0; i < newBlock.length; i++) {
        newBlock[i][0]++;
    }
}

function moveRight() {
    for (i = 0; i < newBlock.length; i++) {
        var downpos = [newBlock[i][0], newBlock[i][1] + 1];
        if (downpos[1] >= 10)
            break;
        if (newBlock.indexOf(downpos) == -1 && gridColors[downpos[0]][downpos[1]] != 0)
            break;
    }
    if (i == newBlock.length) {
        for (i = 0; i < newBlock.length; i++) {
            newBlock[i][1]++;
        }
    }
}

function moveLeft() {
    for (i = 0; i < newBlock.length; i++) {
        var downpos = [newBlock[i][0], newBlock[i][1] - 1];
        if (downpos[0] < 0)
            break;
        if (newBlock.indexOf(downpos) == -1 && gridColors[downpos[0]][downpos[1]] != 0)
            break;
    }
    if (i == newBlock.length) {
        for (i = 0; i < newBlock.length; i++) {
            newBlock[i][1]--;
        }
    }
}

function rotation() {
    newBlockDir = blockTypes(newBlock[0][0], newBlock[0][1]);
    var rotationBlock = newBlockDir[blockType][(blockOffset + 1) % 4];
    for (i = 0; i < rotationBlock.length; i++) {
        var pos = rotationBlock[i];
        if (!(pos[0] >= 0 && pos[0] < 20 && pos[1] >= 0 && pos[1] < 10))
            break;
        if (newBlock.indexOf(pos) == -1 && gridColors[pos[0]][pos[1]] != 0)
            break;
    }
    if (i == rotationBlock.length) {
        newBlock = rotationBlock;
        blockOffset = (blockOffset + 1) % 4;
    }
}

function randomGenerateBlock() {
    blockType = parseInt(Math.random() * 7, 10);
    blockOffset = parseInt(Math.random() * 2, 10);
    blockColor = blockType + 1;
    rx = 1;
    ry = parseInt(Math.random() * 6, 10) + 2;
    newBlockDir = blockTypes(rx, ry);
    newBlock = newBlockDir[blockType][blockOffset];
}

function coreLoop() {
    fpcount = (++fpcount) % 9;
    if (state === PRODUCENEW) {
        if (restart === 1) {
            initGridColors();
            updateColorsArray();
            main();
            restart = 0;
        }
        fullRowCheck();
        randomGenerateBlock();
        if (!endCollisionCheck()) {
            updateColor();
            updateColorsArray();
            main();
            eraseColor();
            state = FALLDOWN;
        } else {
            updateColor();
            updateColorsArray();
            main();
            state = OVER;
        }
    } else if (state === FALLDOWN) {
        if (endCollisionCheck())
            state = OVER;
        else if (!collisionCheck()) {
            moveDown();
            updateColor();
            updateColorsArray();
            main();
            eraseColor();
            state = FALLDOWN;
        } else {
            updateColor();
            updateColorsArray();
            state = COLLISION;
        }
    } else if (state === COLLISION) {
        main();
        state = PRODUCENEW;
    } else if (state === OVER) {
        if (restart === 1)
            state = PRODUCENEW;
    }
}

//main loop function
setInterval(coreLoop, 100);

//main();
//
// Start here
//
function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    // If we don't have a GL context, give up now

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Vertex shader program

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

    // Fragment shader program

    const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    // Draw the scene
    drawScene(gl, programInfo, buffers);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) {

    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.
    /*
      const positions = [
         1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
        -1.0, -1.0,
      ];
    */
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridPosArray), gl.STATIC_DRAW);

    // Now set up the colors for the vertices

    var colors = [
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 1.0, 1.0, 1.0, // white
    ];

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridColorsArray), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
    };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -6.0]); // amount to translate

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = 4;
        for (i = 0; i < 400; i++) {
            if (i < 200)
                gl.drawArrays(gl.TRIANGLE_STRIP, offset + i * 4, vertexCount);
            else
                gl.drawArrays(gl.LINE_LOOP, offset + i * 4, vertexCount);
        }
    }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}