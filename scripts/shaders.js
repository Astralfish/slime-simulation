
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

function linkProgram(gl, vertexShader, fragmentShader, options = {}) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    if (Object.hasOwn(options, "transformFeedbackVaryings") && options.transformFeedbackVaryings instanceof Array) {
        gl.transformFeedbackVaryings(program, options.transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
    }

    if (Object.hasOwn(options, "attributeLocations") && options.attributeLocations instanceof Object) {
        for (const [key, value] in options.attributeLocations)
        {
            gl.bindAttribLocation(program, value, key);
        }
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

function createProgram(gl, vertexSource, fragmentSource, options = {}) {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    const program = linkProgram(gl, vertexShader, fragmentShader, options);
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
