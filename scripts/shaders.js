
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
    const program = gl.CreateProgram();
    program.attachShader(vertexShader);
    program.attachShader(fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if(!success) {
        throw (`Error linking program: ${gl.getProgramInfoLog(program)}`);
    }
}

async function fetchShader(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw (`Error (${response.status}) fetching shader source from ${url}:`);
    }

    return response.text();
}

export { compileShader, linkProgram, fetchShader };