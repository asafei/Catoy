/* eslint-disable prettier/prettier */
/** @format */

import { ImageCube } from '../core';
import { Model } from './Model'
import { Geometry } from './geometry'
import { SkyboxMaterial } from './material'

export class Skybox extends Model {
    constructor(cubmaps?: ImageCube) {
        super(skyboxGeometry, skyboxMaterial);
        skyboxMaterial.maps = cubmaps
        // 绕x旋转90度, 因为本引擎相机z轴朝上为up，而cubemap默认是y轴朝上
        // this.modelMatrix = [1, 0, 0, 0, 0, Math.cos(-Math.PI/2),  -Math.sin(-Math.PI/2), 0, 0, Math.sin(-Math.PI/2), Math.cos(-Math.PI/2), 0, 0, 0, 0, 1]
    }
}

const skyboxVertices = [
    // positions
    -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,

     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0
]
const skyboxGeometry = new Geometry({
    position: {
        data: new Float32Array(skyboxVertices),
        size: 3,
        offset: 0,
        stride: 3 * 4
    },
});
skyboxGeometry.vertexCount = 36

const skyboxMaterial = new SkyboxMaterial()
