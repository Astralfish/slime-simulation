
function compileShader(gl, shaderSource, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!success) {
        throw (`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
    }
   
    return shader;
  }

function linkProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if(!success) {
        throw (`Error linking program: ${gl.getProgramInfoLog(program)}`);
    }

    return program;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    const program = linkProgram(gl, vertexShader, fragmentShader);
    return program; 
}

async function fetchShader(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw (`Error (${response.status}) fetching shader source from ${url}`);
    }

    return response.text();
}

export { compileShader, linkProgram, fetchShader, createProgram };
