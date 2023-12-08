in vec3 position;

uniform mat4 camera_uProjectionMatrix;
uniform mat4 camera_uViewMatrix;
uniform mat4 model_uModelMatrix;

out vec3 vUV;

void main(void) {
    // 放在cpu侧
    mat4 viewMatrixWithoutOffset = mat4(mat3(transpose(inverse(camera_uViewMatrix))));

    vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
    gl_Position = camera_uProjectionMatrix * viewMatrixWithoutOffset * positionWorldSpace;
    // 保证在片源着色器中得到的深度永远是1
    gl_Position = gl_Position.xyww;
    vUV = position;
}