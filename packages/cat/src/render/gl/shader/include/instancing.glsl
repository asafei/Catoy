
#ifdef USE_INSTANCING
    in mat4 model_instanceMatrix;
#endif

#ifdef USE_INSTANCECOLOR
    in vec3 model_instanceColor;
    out vec3 vInstanceColor;
#endif
