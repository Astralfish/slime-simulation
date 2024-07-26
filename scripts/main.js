import * as Shaders from "/scripts/Shaders.js"

const canvas = document.querySelector("#main-canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("no webgl 2!");
}
