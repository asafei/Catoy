/** @format */

import {Material} from './Material'

export class PhongMaterial extends Material {
    public diffuseColor = [1, 1, 1]
    public diffuseMap: HTMLImageElement | undefined = undefined
    public specularColor = [1, 1, 1]
    public specularMap: HTMLImageElement | undefined = undefined
    public shininess = 128

    public environmentMap: HTMLImageElement[] | undefined = undefined
    public reflectivity = 1
    public refractionRatio = 0.98

    constructor() {
        super('PhongMaterial', vsCode, fsCode)
    }

    onBuild(gl: WebGL2RenderingContext): void {
        super.onBuild(gl)
        if (this._program) {
            // 获取与材质相关的uniform
            // const samplerDiffuse = gl.getUniformLocation(this._program, 'u_texture0')
            // const samplerSpecular = gl.getUniformLocation(this._program, 'u_texture1')
            const samplerEnv = gl.getUniformLocation(this._program, 'u_textureEnv')
            // const materialShininess = gl.getUniformLocation(this._program, 'u_materialShininess')

            // TODO: 如何避免重复构建, 还是放在外边
            if (this.environmentMap) {
                // const cubeTexture = gl.createTexture()
                // gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture)
                // for (let i = 0; i < 6; i++) {
                //     const {width, height} = this.environmentMap[i]
                //     gl.texImage2D(
                //         gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                //         0,
                //         gl.RGBA,
                //         width,
                //         height,
                //         0,
                //         gl.RGBA,
                //         gl.UNSIGNED_BYTE,
                //         this.environmentMap[i],
                //     )
                // }
                // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
                // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
                // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)

                // gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
                const cubeTexture = this.createTexture(gl, this.environmentMap)

                this._uniforms._environment = {
                    location: samplerEnv,
                    value: cubeTexture,
                    isTexture: true,
                }
            }
        }
    }

    setup(gl: WebGL2RenderingContext): void {
        const {_environment} = this._uniforms
        gl.activeTexture(gl.TEXTURE0 + 0)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, _environment.value)
        gl.uniform1i(_environment.location, 0)
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

    // uniform vec3 material_uColor;
    // uniform float material_uIsTexture;
    uniform vec3 camera_uPosition;
    // uniform sampler2D material_uTexture;

    // uniform vec3 u_directionalLightDir;
    // uniform vec3 u_directionalLightAmbient;
    // uniform vec3 u_directionalLightDiffuse;
    // uniform vec3 u_directionalLightSpecular;
    // vec3 calculateDirectionalLightColor(
    //     vec3 normalDir,
    //     vec3 viewDir,
    //     float shininess,
    //     vec3 materialDiffuseColor, 
    //     vec3 materialSpecularColor
    // ) {
    //     vec3 ambient = u_directionalLightAmbient * materialDiffuseColor;

    //     vec3 lightDir =  normalize(-u_directionalLightDir);
    //     float diff = max(dot(normalDir, lightDir), 0.0);
    //     vec3 diffuse = u_directionalLightDiffuse * diff * materialDiffuseColor;

    //     vec3 reflectDir = reflect(-lightDir, normalDir);
    //     float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    //     vec3 specular = u_directionalLightSpecular * spec * materialSpecularColor;

    //     vec3 color = ambient + diffuse + specular;
    //     return color;
    // }

    // uniform vec3 u_pointLightPosition;
    // uniform vec3 u_pointLightAmbient;
    // uniform vec3 u_pointLightDiffuse;
    // uniform vec3 u_pointLightSpecular;
    // uniform float u_pointLightConstant;
    // uniform float u_pointLightLinear;
    // uniform float u_pointLightQuadratic;
    // vec3 calculatePointLightColor(
    //     vec3 normalDir,
    //     vec3 fragPos,
    //     vec3 viewDir,
    //     float shininess,
    //     vec3 materialDiffuseColor, 
    //     vec3 materialSpecularColor
    // ) {
    //     float fragDistanceToLight = length(fragPos - u_pointLightPosition);
    //     float attenuation = 1.0 / (u_pointLightConstant + u_pointLightLinear * fragDistanceToLight + u_pointLightQuadratic * (fragDistanceToLight * fragDistanceToLight));

    //     vec3 ambient = attenuation * u_pointLightAmbient * materialDiffuseColor;

    //     vec3 lightDir =  normalize(u_pointLightPosition - fragPos);
    //     float diff = max(dot(normalDir, lightDir), 0.0);
    //     vec3 diffuse = attenuation * u_pointLightDiffuse * diff * materialDiffuseColor;

    //     vec3 reflectDir = reflect(-lightDir, normalDir);
    //     float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    //     vec3 specular = attenuation * u_pointLightSpecular * spec * materialSpecularColor;

    //     vec3 color = ambient + diffuse + specular;
    //     return color;
    // }

    // uniform vec3 u_spotLightPosition;
    // uniform vec3 u_spotLightAmbient;
    // uniform vec3 u_spotLightDiffuse;
    // uniform vec3 u_spotLightSpecular;
    // uniform vec3 u_spotLightDir;
    // uniform float u_spotLightCutOff;
    // uniform float u_spotLightCutOffOuter;
    // uniform float u_spotLightConstant;
    // uniform float u_spotLightLinear;
    // uniform float u_spotLightQuadratic;
    // https://learnopengl-cn.readthedocs.io/zh/latest/02%20Lighting/05%20Light%20casters/
    // vec3 calculateSpotLightColor(
    //     vec3 normalDir,
    //     vec3 fragPos,
    //     vec3 viewDir,
    //     float shininess,
    //     vec3 materialDiffuseColor, 
    //     vec3 materialSpecularColor
    // ) {
    //     // 计算衰减
    //     float fragDistanceToLight = length(fragPos - u_spotLightPosition);
    //     float attenuation = (u_spotLightConstant + u_spotLightLinear * fragDistanceToLight + u_spotLightQuadratic * (fragDistanceToLight * fragDistanceToLight));

    //     // 指向光源
    //     vec3 lightDir = normalize(u_spotLightPosition - fragPos);
    //     float theta = dot(u_spotLightDir, - lightDir);
    //     float epsilon = u_spotLightCutOff - u_spotLightCutOffOuter;
    //     float intensity = clamp((theta - u_spotLightCutOffOuter) / epsilon, 0.0, 1.0);

    //     // 着色
    //     vec3 ambient = u_spotLightAmbient * materialDiffuseColor;

    //     float diff = max(dot(normalDir, lightDir), 0.0);
    //     vec3 diffuse = u_spotLightDiffuse * diff * materialDiffuseColor;

    //     vec3 reflectDir = reflect(-lightDir, normalDir);
    //     float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    //     vec3 specular = u_spotLightSpecular * spec * materialSpecularColor;

    //     return (ambient + diffuse + specular) * intensity * attenuation;
    // }

    vec3 calculateReflectColor(vec3 fragCoord, vec3 viewCoord, vec3 normalCoord, samplerCube skybox){
        vec3 viewTo = normalize(viewCoord - fragCoord);
        vec3 reflectDir = reflect(viewTo, normalCoord);
        vec3 reflectColor = texture(skybox, reflectDir).rgb;
        return reflectColor;
    }

    // vec3 calculateRefractColor(vec3 fragCoord, vec3 viewCoord, vec3 normalCoord, samplerCube skybox){
    //     // 折射率
    //     float ratio = 1.0 / 1.52;
    //     vec3 viewTo = normalize(viewCoord - fragCoord);
    //     vec3 refractDir = refract(viewTo, normalCoord, ratio);
    //     vec3 refractColor = texture(skybox, reflectDir);
    //     return refractColor;
    // }

    // uniform float u_materialShininess;

    // uniform sampler2D u_texture0;
    // uniform sampler2D u_texture1;
    uniform samplerCube u_textureEnv;

    
    out vec4 outColor;

    void main(void) {
        // if(u_IsLight > 0.0){
        //     outColor = vec4(u_Color, 1.0);
        // } else{
        //     vec3 norm = normalize(vNormal);
        //     vec3 viewDir = normalize(u_viewPosition - vFragPos);

        //     vec3 materialDiffuseColor = texture(u_texture0, vUV).rgb;
        //     vec3 materialSpecularColor = texture(u_texture1, vUV).rgb;
            
        //     vec3 directionalColor =  calculateDirectionalLightColor(norm, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
        //     vec3 pointColor =  calculatePointLightColor(norm, vFragPos, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
        //     vec3 spotColor =  calculateSpotLightColor(norm, vFragPos, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
            
        //     vec3 color = directionalColor + pointColor + spotColor;
        //     outColor = vec4(color, 1.0);
        // }

        vec3 reflectColor = calculateReflectColor(vFragPos, camera_uPosition, vNormal, u_textureEnv);
        outColor = vec4(reflectColor, 1);

    }`
