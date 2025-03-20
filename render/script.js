/* © 2025 Octive Interactive LLC */

const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
    throw new Error("WebGL not supported");
}

gl.viewport(0, 0, canvas.width, canvas.height);

gl.clearColor(0.0, 0.0, 0.0, 1.0);

gl.enable(gl.DEPTH_TEST);

const vertexShaderSource = `
    attribute vec4 a_position;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * a_position;
    }
`;

const fragmentShaderSource = `
    precision mediump float; // Set precision

    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color (R, G, B, A)
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
        if (!vertexShader || !fragmentShader) {
            console.error('Cannot create program: One or both shaders are null.');
            return null;
        }
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return null;
		}
		return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(shaderProgram);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const vertices = [];
const numSides = 5;
const radius = 0.5;

for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    vertices.push(x, y, 0.0);
}

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);

gl.vertexAttribPointer(
    positionAttributeLocation,
    3,                     
    gl.FLOAT,               
    false,                  
    0,                     
    0                       
);

const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
const projectionMatrix = glMatrix.mat4.create();

glMatrix.mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

const fieldOfView = 45 * Math.PI / 180;
const aspect = canvas.width / canvas.height;
const zNear = 0.1;
const zFar = 100.0;
glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_modelMatrix');
const viewMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_viewMatrix');
const projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_projectionMatrix');

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
}

let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationX = 0;
let rotationY = 0;

// --- Unified Event Handler Function ---
function handleDragStart(x, y) {
    isDragging = true;
    previousMouseX = x;
    previousMouseY = y;
}

function handleDragMove(x, y) {
    if (!isDragging) return;

    const deltaX = x - previousMouseX;
    const deltaY = y - previousMouseY;

    rotationX += deltaY * 0.01;
    rotationY += deltaX * 0.01;

    glMatrix.mat4.fromRotation(modelMatrix, rotationX, [1, 0, 0]);
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, rotationY);

    previousMouseX = x;
    previousMouseY = y;

    // No need to call drawScene() here; it's in the render loop
}

function handleDragEnd() {
    isDragging = false;
}

// --- Mouse Event Listeners (Modified) ---

canvas.addEventListener('mousedown', (event) => {
    handleDragStart(event.clientX, event.clientY);
});

canvas.addEventListener('mousemove', (event) => {
    handleDragMove(event.clientX, event.clientY);
});

canvas.addEventListener('mouseup', handleDragEnd);

// --- Touch Event Listeners (Added) ---

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent scrolling/zooming on touch
    const touch = event.touches[0]; // Get the first touch point
    handleDragStart(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault(); // VERY IMPORTANT to prevent page scroll
    const touch = event.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchend', (event) => {
     //No need to use event.preventDefault() here as there is no default behavior for touchend on a canvas
    handleDragEnd();
});

canvas.addEventListener('touchcancel', (event) => { 
    //No need to use event.preventDefault() here as there is no default behavior for touchcancel on a canvas
    handleDragEnd();
});


canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

function render(time) {
    drawScene();

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
