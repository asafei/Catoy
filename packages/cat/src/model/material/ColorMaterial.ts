/** @format */

import {Material} from './Material'

export class ColorMaterial extends Material {
    set map(element: HTMLImageElement | undefined) {
        this._map = element
    }

    get map(): HTMLImageElement | undefined {
        return this._map
    }

    constructor(public color = [1, 1, 1], private _map?: HTMLImageElement) {
        super('ColorMaterial', vsCode, fsCode)
        this.map = _map
    }

    onBuild(gl: WebGL2RenderingContext): void {
        super.onBuild(gl)
        if (this._program) {
            const materialColorLocation = gl.getUniformLocation(this._program, 'material_uColor')
            const materialIsTextureLocation = gl.getUniformLocation(this._program, 'material_uIsTexture')
            const materialTextureLocation = gl.getUniformLocation(this._program, 'material_uTexture')

            // TODO: 当map改变时，需要更新texture
            if (this._map !== undefined) {
                const materialTexture = this.createTexture(gl, this._map)

                this._uniforms._materialTexture = {
                    location: materialTextureLocation,
                    value: materialTexture,
                    isTexture: true,
                }
            }

            this._uniforms._materialColor = {
                location: materialColorLocation,
                value: this.color,
                isTexture: false,
            }
            // this._uniforms._materialTexture = {
            //     location: materialTextureLocation,
            //     value: materialTexture,
            //     isTexture: true,
            // }
            this._uniforms._materialIsTexture = {
                location: materialIsTextureLocation,
                isTexture: false,
            }
        }
    }

    setup(gl: WebGL2RenderingContext): void {
        const {_materialColor, _materialTexture, _materialIsTexture} = this._uniforms

        gl.uniform3f(_materialColor.location, this.color[0], this.color[1], this.color[2])
        gl.uniform1f(_materialIsTexture.location, this.map ? 1 : 0)

        if (this._map && _materialTexture) {
            gl.activeTexture(gl.TEXTURE0 + 0)
            gl.bindTexture(gl.TEXTURE_2D, _materialTexture.value)
            gl.uniform1i(_materialTexture.location, 0)
        }
    }

    getUniforms(): string[] {
        return ['color', 'map']
    }
}

const vsCode = `#version 300 es
    in vec3 position;
    in vec3 normal;
    in vec2 uv;

    uniform mat4 camera_uProjectionMatrix;
    uniform mat4 camera_uViewMatrix;
    uniform mat4 model_uModelMatrix;

    out vec3 vNormal;
    out vec3 vFragPos;
    out vec2 vUV;

    void main(void) { 
        vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
        gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
        
        vFragPos = positionWorldSpace.xyz;
        vNormal = mat3(transpose(inverse(model_uModelMatrix))) * normal;
        vUV = uv;
    }`

const fsCode = `#version 300 es
    precision mediump float;

    in vec3 vNormal;
    in vec3 vFragPos;
    in vec2 vUV;

    uniform vec3 material_uColor;
    uniform float material_uIsTexture;
    uniform sampler2D material_uTexture;
    // uniform samplerCube material_uSkyboxTexture;

    uniform vec3 camera_uPosition;

    vec3 calculateReflectColor(vec3 fragCoord, vec3 viewCoord, vec3 normalCoord, samplerCube skybox){
        vec3 viewTo = normalize(viewCoord - fragCoord);
        vec3 reflectDir = reflect(viewTo, normalCoord);
        vec3 reflectColor = texture(skybox, reflectDir).xyz;
        return reflectColor;
    }
    
    out vec4 outColor;

    void main(void) {
        if(material_uIsTexture > 0.0){
            outColor = vec4(texture(material_uTexture, vUV).rgba);
            // outColor = vec4(1.0, 0.0, 1.0, 1.0);
        } else {
            // 测试正方面
            // if(gl_FrontFacing){
            //     outColor = vec4(material_uColor, 1.0);
            // }else{
            //     outColor = vec4(0.0,0.0,1.0, 1.0);
            // }

            // reflect
            // vec3 reflectColor = calculateReflectColor(vFragPos, camera_uPosition, vNormal, material_uSkyboxTexture);
            // outColor = vec4(reflectColor, 1);

            outColor = vec4(material_uColor, 1.0);
        }
    }`
