// Get WebGL context from canvas
const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

let program; // Gemini suggested this to fix a ReferenceError in the render() loop

// Basic WebGL initialization and rendering
function initWebGL() {
    if (!gl) {
        alert('WebGL not supported');
        return false;
    }

    // Match canvas resolution to display
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Define shaders - small programs that run on the GPU
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;  // Set vertex position
        }
    `);

    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
	precision mediump float;
	uniform vec4 u_color;     // Add color uniform
	uniform float u_time;     // Add time uniform
	void main() {
	float shimmer = sin(u_time * 5.0 + gl_FragCoord.x * 0.01 + gl_FragCoord.y * 0.01) * 0.2; // Create a shimmer effect
	vec4 shimmeringColor = u_color + vec4(shimmer, shimmer, shimmer, 1.0);                // Apply shimmer to the color
	gl_FragColor = shimmeringColor;                                                        // Set color using uniform
	}
    `);

    if (!vertexShader || !fragmentShader) return false;

    // Create and link the shader program
    program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    // Define triangle vertices
    const triangleVertices = new Float32Array([
        0.0, 0.5,   // Top vertex
        -0.5, -0.5,  // Bottom left
        0.5, -0.5   // Bottom right
    ]);

    // Create buffer and load vertex data
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

    // Connect buffer to shader's position attribute
    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    // Set initial color (yellow)
    const colorLoc = gl.getUniformLocation(program, 'u_color');
    gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);

    // Add click handler
    canvas.addEventListener('click', () => {
        gl.uniform4f(colorLoc,
            Math.random(),
            Math.random(),
            Math.random(),
            1.0
        );
        targetScale = maxScale; // Start the scale animation
    });

    return true;
}

// Helper function to create and compile shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    // console.log("Compiling shader source:", source); // DEBUG
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Helper function to create and link shader program
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// Animation state
let time = 0;
let rotation = 0;
let rotationSpeed = 0.5;
let scale = 1.0;
let targetScale = 1.0;
const scaleSpeed = 12.0;  // Increased for faster animation
const maxScale = 1.3;    // Slightly reduced max scale for snappier feel
const amplitude = 0.15;  // Height of oscillation (increased for more noticeable effect)
const frequency = 1.5;  // Speed of oscillation
const verticalOffset = 0.333; // Keep triangle more centered vertically

// Start WebGL and render if initialization successful
if (initWebGL()) {
    const originalVertices = new Float32Array([
        0.0, 0.0,   // Top vertex
        -0.5, -0.69,  // Bottom left
        0.5, -0.69   // Bottom right
    ]);
/*    function render() {
        // console.log("Program in render:", program); // DEBUG
        time += 0.016;  // Approximate time step
	gl.useProgram(program);
	const timeLoc = gl.getUniformLocation(program, `u_time`);
	gl.uniform1f(timeLoc, time);
        rotation += rotationSpeed * 0.016;  // Update rotation
        rotationSpeed += (Math.random() - 0.5) * 0.1;  // Randomly adjust rotation speed
        rotationSpeed = Math.max(-2, Math.min(2, rotationSpeed));  // Clamp rotation speed
        
        const offset = (amplitude * Math.sin(time * frequency)) + verticalOffset;

        // Apply rotation to vertices
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        
        // Update vertex positions with rotation, distortion, and vertical motion
        const distortion = 0.2 * Math.sin(time * 0.5);
        // Update scale with smooth transition
        if (Math.abs(scale - targetScale) > 0.01) {
            scale += (targetScale - scale) * 0.016 * scaleSpeed;
        } else if (targetScale > 1.0) {
            targetScale = 1.0;  // Return to normal size
        }

        const animatedVertices = new Float32Array([
            ((originalVertices[0] + distortion) * cos - originalVertices[1] * sin) * scale, 
            ((originalVertices[0] + distortion) * sin + originalVertices[1] * cos + offset) * scale,
            
            ((originalVertices[2] - distortion) * cos - originalVertices[3] * sin) * scale, 
            ((originalVertices[2] - distortion) * sin + originalVertices[3] * cos + offset) * scale,
            
            ((originalVertices[4] + distortion) * cos - originalVertices[5] * sin) * scale, 
            ((originalVertices[4] + distortion) * sin + originalVertices[5] * cos + offset) * scale
        ]);

        // Update buffer with new positions
        gl.bufferData(gl.ARRAY_BUFFER, animatedVertices, gl.STATIC_DRAW);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(render);
    }
    */
	function render() {
    time += 0.016;  // Approximate time step
    gl.useProgram(program);
    const timeLoc = gl.getUniformLocation(program, `u_time`);
    gl.uniform1f(timeLoc, time);
    rotation += rotationSpeed * 0.016;  // Update rotation
    rotationSpeed += (Math.random() - 0.5) * 0.1;  // Randomly adjust rotation speed
    rotationSpeed = Math.max(-2, Math.min(2, rotationSpeed));  // Clamp rotation speed

    const offset = (amplitude * Math.sin(time * frequency)) + verticalOffset;

    // Calculate the center of the original triangle
    const centerX = (originalVertices[0] + originalVertices[2] + originalVertices[4]) / 3;
    const centerY = (originalVertices[1] + originalVertices[3] + originalVertices[5]) / 3;

    // Apply rotation
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const distortion = 0.2 * Math.sin(time * 0.5);

    // Update scale with smooth transition
    if (Math.abs(scale - targetScale) > 0.01) {
        scale += (targetScale - scale) * 0.016 * scaleSpeed;
    } else if (targetScale > 1.0) {
        targetScale = 1.0;  // Return to normal size
    }

    const animatedVertices = new Float32Array([
        ((originalVertices[0] - centerX + distortion) * cos - (originalVertices[1] - centerY) * sin) * scale + centerX * scale,
        ((originalVertices[0] - centerX + distortion) * sin + (originalVertices[1] - centerY) * cos) * scale + centerY * scale + offset * scale,

        ((originalVertices[2] - centerX - distortion) * cos - (originalVertices[3] - centerY) * sin) * scale + centerX * scale,
        ((originalVertices[2] - centerX - distortion) * sin + (originalVertices[3] - centerY) * cos) * scale + centerY * scale + offset * scale,

        ((originalVertices[4] - centerX + distortion) * cos - (originalVertices[5] - centerY) * sin) * scale + centerX * scale,
        ((originalVertices[4] - centerX + distortion) * sin + (originalVertices[5] - centerY) * cos) * scale + centerY * scale + offset * scale
    ]);

    // Update buffer with new positions
    gl.bufferData(gl.ARRAY_BUFFER, animatedVertices, gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(render);
}
    render();
}

