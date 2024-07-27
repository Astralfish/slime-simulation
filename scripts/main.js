import * as Shaders from "/scripts/Shaders.js"

const canvas = document.querySelector("#main-canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("no webgl 2!");
}

console.log("WebGl working")

const simpleVertexSource = await Shaders.fetchShader("/shaders/simple.vert");
const simpleFragmentSource = await Shaders.fetchShader("/shaders/simple.frag");
const simpleProgram = Shaders.createProgram(gl, simpleVertexSource, simpleFragmentSource);

const positionAttributeLocation = gl.getAttribLocation(simpleProgram, "position");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positionData = [
    100, 100,
    200, 300,
    300, 100,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);

const positionVAO = gl.createVertexArray();
gl.bindVertexArray(positionVAO);
gl.enableVertexAttribArray(positionAttributeLocation);

gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const scaleUniformLocation = gl.getUniformLocation(simpleProgram, "scale");

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(simpleProgram);

gl.uniform2f(scaleUniformLocation, 2.0 / gl.canvas.width, 2.0 / gl.canvas.height);

gl.bindVertexArray(positionVAO);

gl.drawArrays(gl.TRIANGLES, 0, 3);
