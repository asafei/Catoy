
uniform vec3 spotLight_uColor;
uniform vec3 spotLight_uPosition;
uniform vec3 spotLight_uDir;
uniform float spotLight_uCutOff;
uniform float spotLight_uCutOffOuter;
uniform float spotLight_uConstant;
uniform float spotLight_uLinear;
uniform float spotLight_uQuadratic;

// https://learnopengl-cn.readthedocs.io/zh/latest/02%20Lighting/05%20Light%20casters/
vec3 calculateSpotPhongLightColor(
    vec3 normalDir,
    vec3 fragPos,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    // 计算衰减
    float fragDistanceToLight = length(fragPos - spotLight_uPosition);
    float attenuation = 1.0 / (spotLight_uConstant + spotLight_uLinear * fragDistanceToLight + spotLight_uQuadratic * (fragDistanceToLight * fragDistanceToLight));

    // 指向光源
    vec3 lightDir = normalize(spotLight_uPosition - fragPos);
    float theta = dot(spotLight_uDir, - lightDir);
    float epsilon = spotLight_uCutOff - spotLight_uCutOffOuter;
    float intensity = clamp((theta - spotLight_uCutOffOuter) / epsilon, 0.0, 1.0);

    // 着色
    vec3 ambient = spotLight_uColor * materialDiffuseColor;

    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = spotLight_uColor * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spotLight_uColor * spec * materialSpecularColor;

    return (ambient + diffuse + specular) * intensity * attenuation;
} 

/*
uniform vec3 spotLight_uAmbient;
uniform vec3 spotLight_uDiffuse;
uniform vec3 spotLight_uSpecular;

uniform vec3 spotLight_uPosition;
uniform vec3 spotLight_uDir;
uniform float spotLight_uCutOff;
uniform float spotLight_uCutOffOuter;
uniform float spotLight_uConstant;
uniform float spotLight_uLinear;
uniform float spotLight_uQuadratic;

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
    float fragDistanceToLight = length(fragPos - spotLight_uPosition);
    float attenuation = 1.0 / (spotLight_uConstant + spotLight_uLinear * fragDistanceToLight + spotLight_uQuadratic * (fragDistanceToLight * fragDistanceToLight));

    // 指向光源
    vec3 lightDir = normalize(spotLight_uPosition - fragPos);
    float theta = dot(spotLight_uDir, - lightDir);
    float epsilon = spotLight_uCutOff - spotLight_uCutOffOuter;
    float intensity = clamp((theta - spotLight_uCutOffOuter) / epsilon, 0.0, 1.0);

    // 着色
    vec3 ambient = spotLight_uAmbient * materialDiffuseColor;

    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = spotLight_uDiffuse * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spotLight_uSpecular * spec * materialSpecularColor;

    return (ambient + diffuse + specular) * intensity * attenuation;
} 
*/