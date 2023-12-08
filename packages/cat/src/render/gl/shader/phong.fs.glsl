#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vUV;

uniform vec3 u_Color;
uniform float u_IsLight;
uniform vec3 u_viewPosition;

uniform vec3 u_directionalLightDir;
uniform vec3 u_directionalLightAmbient;
uniform vec3 u_directionalLightDiffuse;
uniform vec3 u_directionalLightSpecular;
vec3 calculateDirectionalLightColor(
    vec3 normalDir,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    vec3 ambient = u_directionalLightAmbient * materialDiffuseColor;

    vec3 lightDir =  normalize(-u_directionalLightDir);
    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = u_directionalLightDiffuse * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = u_directionalLightSpecular * spec * materialSpecularColor;

    vec3 color = ambient + diffuse + specular;
    return color;
} 

uniform vec3 u_pointLightPosition;
uniform vec3 u_pointLightAmbient;
uniform vec3 u_pointLightDiffuse;
uniform vec3 u_pointLightSpecular;
uniform float u_pointLightConstant;
uniform float u_pointLightLinear;
uniform float u_pointLightQuadratic;
vec3 calculatePointLightColor(
    vec3 normalDir,
    vec3 fragPos,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    float fragDistanceToLight = length(fragPos - u_pointLightPosition);
    float attenuation = 1.0 / (u_pointLightConstant + u_pointLightLinear * fragDistanceToLight + u_pointLightQuadratic * (fragDistanceToLight * fragDistanceToLight));

    vec3 ambient = attenuation * u_pointLightAmbient * materialDiffuseColor;

    vec3 lightDir =  normalize(u_pointLightPosition - fragPos);
    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = attenuation * u_pointLightDiffuse * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = attenuation * u_pointLightSpecular * spec * materialSpecularColor;

    vec3 color = ambient + diffuse + specular;
    return color;
}

uniform vec3 u_spotLightPosition;
uniform vec3 u_spotLightAmbient;
uniform vec3 u_spotLightDiffuse;
uniform vec3 u_spotLightSpecular;
uniform vec3 u_spotLightDir;
uniform float u_spotLightCutOff;
uniform float u_spotLightCutOffOuter;
uniform float u_spotLightConstant;
uniform float u_spotLightLinear;
uniform float u_spotLightQuadratic;

// https://learnopengl-cn.readthedocs.io/zh/latest/02%20Lighting/05%20Light%20casters/
vec3 calculateSpotLightColor(
    vec3 normalDir,
    vec3 fragPos,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    // 计算衰减
    float fragDistanceToLight = length(fragPos - u_spotLightPosition);
    float attenuation = 1.0 / (u_spotLightConstant + u_spotLightLinear * fragDistanceToLight + u_spotLightQuadratic * (fragDistanceToLight * fragDistanceToLight));

    // 指向光源
    vec3 lightDir = normalize(u_spotLightPosition - fragPos);
    float theta = dot(u_spotLightDir, - lightDir);
    float epsilon = u_spotLightCutOff - u_spotLightCutOffOuter;
    float intensity = clamp((theta - u_spotLightCutOffOuter) / epsilon, 0.0, 1.0);

    // 着色
    vec3 ambient = u_spotLightAmbient * materialDiffuseColor;

    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = u_spotLightDiffuse * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = u_spotLightSpecular * spec * materialSpecularColor;

    return (ambient + diffuse + specular) * intensity * attenuation;
} 


// uniform vec3 u_materialAmbient;
// uniform vec3 u_materialDiffuse;
// uniform vec3 u_materialSpecular;
uniform float u_materialShininess;

uniform sampler2D u_texture0;
uniform sampler2D u_texture1;

out vec4 outColor;

void main(void) {
    if(u_IsLight > 0.0){
        outColor = vec4(u_Color, 1.0);
    } else{
        vec3 norm = normalize(vNormal);
        vec3 viewDir = normalize(u_viewPosition - vFragPos);

        vec3 materialDiffuseColor = texture(u_texture0, vUV).rgb;
        vec3 materialSpecularColor = texture(u_texture1, vUV).rgb;
        
        vec3 directionalColor =  calculateDirectionalLightColor(norm, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
        vec3 pointColor =  calculatePointLightColor(norm, vFragPos, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
        vec3 spotColor =  calculateSpotLightColor(norm, vFragPos, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
        
        vec3 color = directionalColor + pointColor + spotColor;
        outColor = vec4(color, 1.0);
    }
}