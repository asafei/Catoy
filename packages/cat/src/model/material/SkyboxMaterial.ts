/** @format */

import {Color, ImageCube} from '../../core'
import {Material} from './Material'
import VSCode from '../../render/gl/shader/skybox.vs.glsl'
import FSCode from '../../render/gl/shader/skybox.fs.glsl'

export class SkyboxMaterial extends Material {
    depthTest = true
    depthFunc = 515
    set maps(element: ImageCube | undefined) {
        this._maps = element
    }

    get maps(): ImageCube | undefined {
        return this._maps
    }

    get Color(): Color {
        return this.color
    }

    get CubeTexture(): ImageCube | undefined {
        return this._maps
    }

    get IsTexture(): boolean {
        return this._maps !== undefined
    }

    constructor(public color: Color = [1, 1, 1], private _maps?: ImageCube) {
        super('SkyboxMaterial', vsCode, fsCode)
        this.maps = _maps
        this.VSCode = VSCode
        this.FSCode = FSCode
    }

    onBuild(gl: WebGL2RenderingContext): void {
        super.onBuild(gl)
        if (this._program) {
            const materialColorLocation = gl.getUniformLocation(this._program, 'material_uColor')
            const materialIsTextureLocation = gl.getUniformLocation(this._program, 'material_uIsTexture')
            const materialTextureLocation = gl.getUniformLocation(this._program, 'material_uTexture')
            if (this._maps !== undefined) {
                const cubeTexture = this.createTexture(gl, this._maps)

                this._uniforms._materialTexture = {
                    location: materialTextureLocation,
                    value: cubeTexture,
                    isTexture: true,
                }
            }

            this._uniforms._materialColor = {
                location: materialColorLocation,
                value: this.color,
                isTexture: false,
            }
            this._uniforms._materialIsTexture = {
                location: materialIsTextureLocation,
                isTexture: false,
            }
        }
    }

    setup(gl: WebGL2RenderingContext): void {
        const {_materialColor, _materialTexture, _materialIsTexture} = this._uniforms
        gl.uniform3f(_materialColor.location, this.color[0], this.color[1], this.color[2])
        gl.uniform1f(_materialIsTexture.location, this._maps ? 1 : 0)

        if (this._maps && _materialTexture) {
            gl.activeTexture(gl.TEXTURE0 + 0)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, _materialTexture.value)
            gl.uniform1i(_materialTexture.location, 0)
        }
    }

    getUniforms(): string[] {
        return ['color', 'maps']
    }
}

const vsCode = `#version 300 es
    in vec3 position;

    uniform mat4 camera_uProjectionMatrix;
    uniform mat4 camera_uViewMatrix;
    uniform mat4 model_uModelMatrix;

    out vec3 vUV;

    void main(void) {
        // 放在cpu侧
        mat4 viewMatrixWithoutOffset = mat4(mat3(transpose(inverse(camera_uViewMatrix))));

        vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
        gl_Position = camera_uProjectionMatrix * viewMatrixWithoutOffset * positionWorldSpace;
        // 保证在片源着色器中得到的深度永远是1
        gl_Position = gl_Position.xyww;
        vUV = position;
    }`

const fsCode = `#version 300 es
    precision mediump float;

    in vec3 vUV;
    uniform vec3 material_uColor;
    uniform float material_uIsTexture;
    uniform samplerCube material_uTexture;
    
    out vec4 outColor;

    void main(void) {
        if(material_uIsTexture > 0.0){
            outColor = vec4(texture(material_uTexture, vUV).rgb, 1);
        } else {
            outColor = vec4(material_uColor, 1.0);
        }
    }`
