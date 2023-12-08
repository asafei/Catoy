#version 300 es
// phong.vs.glsl

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
    // vNormal = normal;
    vNormal = mat3(transpose(inverse(model_uModelMatrix))) * normal;
    vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
    gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
    vFragPos = positionWorldSpace.xyz;
    vUV = uv;
}
