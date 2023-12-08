
precision mediump float;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vUV;

#ifdef USE_INSTANCECOLOR
    in vec3 vInstanceColor;
#endif

uniform vec3 material_uColor;
uniform float material_uIsTexture;
uniform sampler2D material_uTexture;
uniform sampler2D material_uTexture2;


out vec4 outColor;

void main(void) {
    #ifdef USE_INSTANCECOLOR
        outColor = vec4(vInstanceColor, 1.0);
        return;
    #endif


    // if的话相当于每一shading都执行一次判断
    if(material_uIsTexture > 0.0){
        outColor = vec4(texture(material_uTexture, vUV).rgba);
    } else {
        // 测试正方面
        // if(gl_FrontFacing){
        //     outColor = vec4(material_uColor, 1.0);
        // }else{
        //     outColor = vec4(0.0,0.0,1.0, 1.0);
        // }

        // reflect
        // vec3 reflectColor = calculateReflectColor(vFragPos, camera_uPosition, vNormal, material_uSkyboxTexture);
        // outColor = vec4(reflectColor, 1);

        outColor = vec4(material_uColor, 1.0);
    }
}



