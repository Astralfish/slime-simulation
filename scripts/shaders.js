
function compileShader(gl, shaderSource, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!success) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw (`Error compiling shader: ${message}`);
    }
   
    return shader;
  }

function linkProgram(gl, vertexShader, fragmentShader, transformFeedbackVaryings) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    if (transformFeedbackVaryings) {
        gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
    }

    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!success) {
        const message = gl.getProgramInfoLog(program);
        gl.deleteProgram();
        throw (`Error linking program: ${message}`);
    }

    return program;
}

function createProgram(gl, vertexSource, fragmentSource, transformFeedbackVaryings) {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    const program = linkProgram(gl, vertexShader, fragmentShader, transformFeedbackVaryings);
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
