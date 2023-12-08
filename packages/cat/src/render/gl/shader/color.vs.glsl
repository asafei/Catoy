
in vec3 position;
in vec3 normal;
in vec2 uv;

#include "./include/instancing.glsl";

uniform mat4 camera_uProjectionMatrix;
uniform mat4 camera_uViewMatrix;
uniform mat4 model_uModelMatrix;

out vec3 vNormal;
out vec3 vFragPos;
out vec2 vUV;

void main(void) {
    mat4 modelMatrix = mat4(1.0);
    #if defined(USE_INSTANCING)
        modelMatrix = model_instanceMatrix;
    #else
        modelMatrix = model_uModelMatrix;
    #endif

    #ifdef USE_INSTANCECOLOR
        vInstanceColor = model_instanceColor;
    #endif

    vec4 positionWorldSpace = modelMatrix * vec4(position, 1.);
    gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;


    vFragPos = positionWorldSpace.xyz;
    vNormal = mat3(transpose(inverse(modelMatrix))) * normal;
    vUV = uv;
}