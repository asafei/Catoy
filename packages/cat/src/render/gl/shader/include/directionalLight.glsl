

uniform vec3 directionalLight_uColor;
uniform vec3 directionalLight_uDir;

vec3 calculateDirectionalPhongLightColor(
    vec3 normalDir,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    vec3 ambient = directionalLight_uColor * materialDiffuseColor;

    vec3 lightDir = normalize(-directionalLight_uDir);
    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = directionalLight_uColor * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = directionalLight_uColor * spec * materialSpecularColor;

    vec3 color = ambient + diffuse + specular;
    return color;
} 

/*
// 书本上的phong光照模型
uniform vec3 directionalLight_uAmbient;
uniform vec3 directionalLight_uDiffuse;
uniform vec3 directionalLight_uSpecular;

uniform vec3 directionalLight_uDir;

vec3 calculateDirectionalLightColor_phong(
    vec3 normalDir,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    vec3 ambient = directionalLight_uAmbient * materialDiffuseColor;

    vec3 lightDir = normalize(-directionalLight_uDir);
    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = directionalLight_uDiffuse * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = directionalLight_uSpecular * spec * materialSpecularColor;

    vec3 color = ambient + diffuse + specular;
    return color;
} 
*/