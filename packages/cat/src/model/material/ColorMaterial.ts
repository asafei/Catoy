/** @format */

import {Material} from './Material'

export class ColorMaterial extends Material {
    set map(element: HTMLImageElement | undefined) {
        this._map = element
    }

    get map() {
        return this._map
    }

    constructor(public color = [1, 1, 1], private _map?: HTMLImageElement) {
        super('ColorMaterial', vsCode, fsCode)
        this.map = _map
    }

    getUniforms(): string[] {
        return ['color', 'map']
    }
}

const vsCode = `#version 300 es
    in vec3 position;
    in vec2 uv;

    uniform mat4 camera_uProjectionMatrix;
    uniform mat4 camera_uViewMatrix;
    uniform mat4 model_uModelMatrix;

    out vec2 vUV;

    void main(void) { 
        vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
        gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
        vUV = uv;
    }`

const fsCode = `#version 300 es
    precision mediump float;

    in vec2 vUV;
    uniform vec3 material_uColor;
    uniform float material_uIsTexture;
    uniform sampler2D material_uTexture;
    

    
    out vec4 outColor;

    void main(void) {
        if(material_uIsTexture > 0.0){
            outColor = vec4(texture(material_uTexture, vUV).rgba);
            // outColor = vec4(1.0, 0.0, 1.0, 1.0);
        } else {
            outColor = vec4(material_uColor, 1.0);
        }
    }`
