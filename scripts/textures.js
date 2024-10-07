
let internalFormats = null;

let formats = null;

function createTexture(gl, width, height, channelCount, type, data) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    initializeFormats(gl);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormats[type][channelCount],
        width,
        height,
        0,
        formats[type][channelCount],
        type,
        data
    );

    return texture;
}

function createFramebuffer(gl, texture) {
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
    console.log(`Framebuffer creation status: ${status}`);
    return frameBuffer;
}

function initializeFormats(gl)
{
    if (!internalFormats)
    {
        internalFormats = {};
        internalFormats[gl.FLOAT] = [gl.R32F, gl.RG32F, gl.RGB32F, gl.RGBA32F];
        internalFormats[gl.INT] = [gl.R32I, gl.RG32I, gl.RGB32I, gl.RGBA32I];
        internalFormats[gl.UINT] = [gl.R32UI, gl.RG32UI, gl.RGB32UI, gl.RGBA32UI];
    }

    if (!formats)
    {
        formats = {};
        formats[gl.FLOAT] = [gl.R, gl.RG, gl.RGB, gl.RGBA];
        formats[gl.INT] = [gl.RED_INTEGER, gl.RG_INTEGER, gl.RGB_INTEGER, gl.RGBA_INTEGER];
        formats[gl.UINT] = [gl.RED_INTEGER, gl.RG_INTEGER, gl.RGB_INTEGER, gl.RGBA_INTEGER];
    }
}

export { createTexture, createFramebuffer };
