/** @format */

import {Material} from './Material'

export class BaseMaterial extends Material {
    public type = 'BaseMaterial'
    public vsCode = vsCode
    public fsCode = fsCode

    getUnifroms(): string[] {
        // error;camera应该分类给camera
        return ['camera_uProjectionMatrix', 'camera_uViewMatrix', 'model_uModelMatrix']
    }
}

const vsCode =
    'attribute vec3 position;\n' +
    'attribute vec3 normal;\n' +
    'uniform mat4 camera_uProjectionMatrix;\n' +
    'uniform mat4 camera_uViewMatrix;\n' +
    'uniform mat4 model_uModelMatrix;\n' +
    'varying vec3 vNormal;\n' +
    'void main(void) { \n' +
    'vNormal = normal;\n' +
    'vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);\n' +
    'gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;\n' +
    '}'
const fsCode =
    'precision mediump float;\n' +
    'varying vec3 vNormal;\n' +
    'void main(void) {\n' +
    'gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);\n' +
    '}'
