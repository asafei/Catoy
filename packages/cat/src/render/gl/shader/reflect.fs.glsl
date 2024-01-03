
in vec3 vNormal;
in vec3 vFragPos;

uniform vec3 material_uEnvColor;
uniform float material_uIsTexture;
uniform vec3 camera_uPosition;

uniform samplerCube material_uTextureEnv;

vec3 calculateReflectColor(vec3 fragCoord, vec3 viewCoord, vec3 normalCoord, samplerCube skybox){
    vec3 viewTo = normalize(fragCoord - viewCoord);
    vec3 reflectDir = reflect(viewTo, normalCoord);
    vec3 reflectColor = texture(skybox, reflectDir).rgb;
    return reflectColor;
}

out vec4 outColor;

void main(void) {
    if(material_uIsTexture > 0.0){
        vec3 reflectColor = calculateReflectColor(vFragPos, camera_uPosition, vNormal, material_uTextureEnv);
        outColor = vec4(reflectColor, 1);
    } else {
        outColor = vec4(material_uEnvColor, 1.0);
    }
}