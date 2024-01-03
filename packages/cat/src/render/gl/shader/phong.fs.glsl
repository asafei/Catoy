
in vec3 vNormal;
in vec3 vFragPos;
in vec2 vUV;

uniform vec3 camera_uPosition;
// uniform vec3 material_uAmbientColor;
uniform vec3 material_uDiffuseColor;
uniform float material_uIsDiffuseMap;
uniform vec3 material_uSpecularColor;
uniform float material_uIsSpecularMap;
uniform float material_uShininess;

// phong材质的灯光
// uniform vec3 material_uAmbientLight;
// uniform vec3 material_uDiffuseLight;
// uniform vec3 material_uSpecularLight;
#include "./include/directionalLight.glsl";
#include "./include/pointLight.glsl";
#include "./include/spotLight.glsl";

uniform sampler2D material_uDiffuseMap;
uniform sampler2D material_uSpecularMap;

out vec4 outColor;

void main(void) {
    // TODO: 区分材质是颜色还是纹理
    vec3 norm = normalize(vNormal);
    vec3 viewDir = normalize(camera_uPosition - vFragPos);
    
    vec3 color = vec3(0.0);

    vec3 materialDiffuseColor = material_uDiffuseColor;
    if (material_uIsDiffuseMap > 0.0) {
        materialDiffuseColor.rgb = texture(material_uDiffuseMap, vUV).rgb;
    }

    vec3 materialSpecularColor = material_uSpecularColor;
    if (material_uIsSpecularMap > 0.0) {
        materialSpecularColor.rgb = texture(material_uSpecularMap, vUV).rgb;
    }


    // #ifdef USE_POINTLIGHT
        // vec3 pointColor =  calculatePointPhongLightColor(norm, vFragPos, viewDir, material_uShininess, materialDiffuseColor, materialSpecularColor);
        // color += pointColor;
    // #endif

    // #ifdef USE_DIRECTIONALLIGHT
        // vec3 directionalColor =  calculateDirectionalPhongLightColor(norm, viewDir, material_uShininess, materialDiffuseColor, materialSpecularColor);
        // color += directionalColor;
    // #endif

    // #ifdef USE_SPOTLIGHT
        vec3 spotColor =  calculateSpotPhongLightColor(norm, vFragPos, viewDir, material_uShininess, materialDiffuseColor, materialSpecularColor);
        color += spotColor;
    // #endif

    outColor = vec4(color, 1.0);
}