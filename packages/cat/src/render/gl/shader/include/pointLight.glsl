
uniform vec3 pointLight_uColor;
uniform vec3 pointLight_uPosition;
uniform float pointLight_uConstant;
uniform float pointLight_uLinear;
uniform float pointLight_uQuadratic;


vec3 calculatePointPhongLightColor(
    vec3 normalDir,
    vec3 fragPos,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    float fragDistanceToLight = length(fragPos - pointLight_uPosition);
    float attenuation = 1.0 / (pointLight_uConstant + pointLight_uLinear * fragDistanceToLight + pointLight_uQuadratic * (fragDistanceToLight * fragDistanceToLight));

    vec3 ambient = attenuation * pointLight_uColor * materialDiffuseColor;

    vec3 lightDir =  normalize(pointLight_uPosition - fragPos);
    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = attenuation * pointLight_uColor * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = attenuation * pointLight_uColor * spec * materialSpecularColor;

    vec3 color = ambient + diffuse + specular;
    return color;
}

/*
uniform vec3 pointLight_uAmbient;
uniform vec3 pointLight_uDiffuse;
uniform vec3 pointLight_uSpecular;

uniform vec3 pointLight_uPosition;
uniform float pointLight_uConstant;
uniform float pointLight_uLinear;
uniform float pointLight_uQuadratic;


vec3 calculatePointLightColor(
    vec3 normalDir,
    vec3 fragPos,
    vec3 viewDir,
    float shininess,
    vec3 materialDiffuseColor, 
    vec3 materialSpecularColor
) {
    float fragDistanceToLight = length(fragPos - pointLight_uPosition);
    float attenuation = 1.0 / (pointLight_uConstant + pointLight_uLinear * fragDistanceToLight + pointLight_uQuadratic * (fragDistanceToLight * fragDistanceToLight));

    vec3 ambient = attenuation * pointLight_uAmbient * materialDiffuseColor;

    vec3 lightDir =  normalize(pointLight_uPosition - fragPos);
    float diff = max(dot(normalDir, lightDir), 0.0);
    vec3 diffuse = attenuation * pointLight_uDiffuse * diff * materialDiffuseColor;

    vec3 reflectDir = reflect(-lightDir, normalDir);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = attenuation * pointLight_uSpecular * spec * materialSpecularColor;

    vec3 color = ambient + diffuse + specular;
    return color;
}
*/