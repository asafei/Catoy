/** @format */

import {Color, ImageCube} from '../../core'
import {Material} from './Material'
import VSCode from '../../render/gl/shader/reflect.vs.glsl'
import FSCode from '../../render/gl/shader/reflect.fs.glsl'

export class ReflectMaterial extends Material {
    // public environmentMap: HTMLImageElement[] | undefined = undefined
    // public reflectivity = 1
    // public refractionRatio = 0.98

    public environment!: Color | ImageCube

    get EnvColor(): Color {
        return this.environment.length === 6 ? [1, 0, 0] : this.environment
    }

    get IsTexture(): boolean {
        return this.environment.length === 6 ? true : false
    }

    get TextureEnv(): ImageCube | undefined {
        return this.environment.length === 6 ? this.environment : undefined
    }

    constructor(environment: Color | ImageCube) {
        super('ReflectMaterial', vsCode, fsCode)
        this.environment = environment
        this.VSCode = VSCode
        this.FSCode = FSCode
    }
}

const vsCode = `#version 300 es
    in vec3 position;
    in vec3 normal;
    in vec2 uv;

    in vec3 model_instanceColor;
    in mat4 model_instanceMatrix;

    uniform mat4 camera_uProjectionMatrix;
    uniform mat4 camera_uViewMatrix;
    uniform mat4 model_uModelMatrix;
    uniform float model_uIsInstancing;

    out vec3 vNormal;
    out vec3 vFragPos;
    out vec2 vUV;

    void main(void) { 
        mat4 mMatrix = model_uIsInstancing > 0.0 ? model_instanceMatrix : model_uModelMatrix;
        
        vec4 positionWorldSpace = mMatrix * vec4(position, 1.);
        gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
        
        vFragPos = positionWorldSpace.xyz;
        vNormal = mat3(transpose(inverse(mMatrix))) * normal;
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
        vec3 viewTo = normalize(fragCoord - viewCoord);
        vec3 reflectDir = reflect(viewTo, normalCoord);
        vec3 reflectColor = texture(skybox, reflectDir).rgb;
        return reflectColor;
    }

    // vec3 calculateRefractColor(vec3 fragCoord, vec3 viewCoord, vec3 normalCoord, samplerCube skybox){
    //     // 折射率: 空气的折射率是1.0, 水是1.333, 玻璃是1.52, 金属是2.42, 钻石是2.41
    //     float ratio = 1.0 / 1.52;
    //     vec3 viewTo = normalize(fragCoord - viewCoord);
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
