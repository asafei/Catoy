
in vec3 vUV;
uniform vec3 material_uColor;
uniform float material_uIsTexture;
uniform samplerCube material_uCubeTexture;

out vec4 outColor;

void main(void) {
    if(material_uIsTexture > 0.0){
        outColor = vec4(texture(material_uCubeTexture, vUV).rgb, 1);
    } else {
        outColor = vec4(material_uColor, 1.0);
    }
    // outColor = vec4(1., 1., 0.0, 1.);
}