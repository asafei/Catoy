/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube, createPlane, createShape, createSphere} from '../data'
import {WGLUtil, OrbitControl, PerspectiveCamera} from 'cat'

const materialPhongs = [
    {
        ambient: [1, 0.5, 0.31],
        diffuse: [1, 0.5, 0.31],
        specular: [0.5, 0.5, 0.5],
        shininess: 0.25,
    },
    {
        ambient: [0.0215, 0.1745, 0.0215],
        diffuse: [0.07568, 0.61424, 0.07568],
        specular: [0.633, 0.727811, 0.633],
        shininess: 0.6,
    },
    {
        ambient: [0.135, 0.2225, 0.1575],
        diffuse: [0.54, 0.89, 0.63],
        specular: [0.316288, 0.316288, 0.316288],
        shininess: 0.1,
    },
    {
        ambient: [0.05375, 0.05, 0.06625],
        diffuse: [0.18275, 0.17, 0.22525],
        specular: [0.332741, 0.328634, 0.346435],
        shininess: 0.3,
    },
    {
        ambient: [0.25, 0.20725, 0.20725],
        diffuse: [1, 0.829, 0.829],
        specular: [0.296648, 0.296648, 0.296648],
        shininess: 0.088,
    },
]

/**
 * 使用webgl2
 * phong 光照模型
 * 材质也有三属性: ambient, diffuse, specular
 * 光源也有三属性: ambient, diffuse, specular
 */
function Light6(): JSX.Element {
    useEffect(() => {
        const element = document.getElementById('container')
        const canvas = document.createElement('canvas')
        element?.appendChild(canvas)
        canvas.className = 'canvas'
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const gl = canvas.getContext('webgl2')!

        const light = {
            color: [1, 1, 1],
            position: [1, 1, 1],
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.5, 0.5, 0.5],
            specular: [1, 1, 1],
        }

        const models: any[] = [
            {
                name: 'cube',
                execute: createSphere,
                color: [1, 0, 0],
                material: materialPhongs[0],
                isLight: false,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
            {
                name: 'cubeLight',
                execute: createCube,
                color: light.color,
                isLight: true,
                objectModelMatrix: new Float32Array([0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]),
            },
            {
                name: 'plane',
                execute: createPlane,
                color: [1, 1, 0],
                material: materialPhongs[1],
                isLight: false,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
        ].map(({name, color, isLight, material, execute, objectModelMatrix}) => {
            const {vertices, normals, indices} = execute()
            const vertex_buffer = WGLUtil.createBufferAndBindData(
                gl,
                gl.ARRAY_BUFFER,
                new Float32Array(vertices),
                gl.STATIC_DRAW,
            )
            const normal_buffer = WGLUtil.createBufferAndBindData(
                gl,
                gl.ARRAY_BUFFER,
                new Float32Array(normals),
                gl.STATIC_DRAW,
            )
            const index_buffer = WGLUtil.createBufferAndBindData(
                gl,
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(indices),
                gl.STATIC_DRAW,
            )
            return {
                name,
                objectModelMatrix,
                isLight,
                material,
                indexLength: indices.length,
                color,
                vao: null,
                attributes: {
                    vertex_buffer,
                    normal_buffer,
                    index_buffer,
                },
            }
        })

        // {
        // 主shader
        const mainVertCode = `#version 300 es
            in vec3 position;
            in vec3 normal;

            uniform mat4 camera_uProjectionMatrix;
            uniform mat4 camera_uViewMatrix;
            uniform mat4 model_uModelMatrix;

            out vec3 vNormal;
            out vec3 vFragPos;

            void main(void) { 
                // vNormal = normal;
                vNormal = mat3(transpose(inverse(model_uModelMatrix))) * normal;
                vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
                gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
                vFragPos = positionWorldSpace.xyz;
            }`
        const mainFragCode = `#version 300 es
            precision mediump float;

            in vec3 vNormal;
            in vec3 vFragPos;

            uniform vec3 u_Color;
            uniform float u_IsLight;
            uniform vec3 u_viewPosition;


            uniform vec3 u_lightPosition;
            uniform vec3 u_lightColor;
            uniform vec3 u_lightAmbient;
            uniform vec3 u_lightDiffuse;
            uniform vec3 u_lightSpecular;

            uniform vec3 u_materialAmbient;
            uniform vec3 u_materialDiffuse;
            uniform vec3 u_materialSpecular;
            uniform float u_materialShininess;

            out vec4 outColor;

            
            void main(void) {
                if(u_IsLight > 0.0){
                    outColor = vec4(u_Color, 1.0);
                } else{
                    vec3 ambient = u_lightAmbient * u_materialAmbient;

                    // 计算漫反射
                    vec3 norm = normalize(vNormal);
                    vec3 lightDir = normalize(u_lightPosition - vFragPos);
                    float diff = max(dot(norm, lightDir), 0.0);
                    vec3 diffuse = u_lightDiffuse * (diff * u_materialDiffuse);


                    // 计算镜面反射
                    vec3 viewDir = normalize(u_viewPosition - vFragPos);
                    vec3 reflectDir = reflect(-lightDir, norm);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_materialShininess);
                    vec3 specular = u_lightSpecular * (spec * u_materialSpecular);

                    vec3 color = ambient + diffuse + specular;
                    outColor = vec4(color, 1.0);
                }
            }`

        const mainProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, mainFragCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')
        const main_modelColor = gl.getUniformLocation(mainProgram, 'u_Color')

        const main_uIsLight = gl.getUniformLocation(mainProgram, 'u_IsLight')
        const main_uLightPosition = gl.getUniformLocation(mainProgram, 'u_lightPosition')
        const main_uLightColor = gl.getUniformLocation(mainProgram, 'u_lightColor')
        const main_uLightAmbient = gl.getUniformLocation(mainProgram, 'u_lightAmbient')
        const main_uLightDiffuse = gl.getUniformLocation(mainProgram, 'u_lightDiffuse')
        const main_uLightSpecular = gl.getUniformLocation(mainProgram, 'u_lightSpecular')
        const main_uMaterialAmbient = gl.getUniformLocation(mainProgram, 'u_materialAmbient')
        const main_uMaterialDiffuse = gl.getUniformLocation(mainProgram, 'u_materialDiffuse')
        const main_uMaterialSpecular = gl.getUniformLocation(mainProgram, 'u_materialSpecular')
        const main_uMaterialShininess = gl.getUniformLocation(mainProgram, 'u_materialShininess')
        const main_uViewPosition = gl.getUniformLocation(mainProgram, 'u_viewPosition')

        models.forEach(modelInfo => {
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)

            // 将buffer与着色器绑定
            gl.bindBuffer(gl.ARRAY_BUFFER, modelInfo.attributes.vertex_buffer)
            const main_Position = gl.getAttribLocation(mainProgram, 'position')
            gl.vertexAttribPointer(main_Position, 3, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(main_Position)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)

            gl.bindBuffer(gl.ARRAY_BUFFER, modelInfo.attributes.normal_buffer)
            const main_Normal = gl.getAttribLocation(mainProgram, 'normal')
            gl.vertexAttribPointer(main_Normal, 3, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(main_Normal)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)

            gl.bindVertexArray(null)
            modelInfo.vao = vao
        })

        const camera = new PerspectiveCamera(Math.PI / 4, canvas.width / canvas.height, 1, 100)
        const control = new OrbitControl(canvas, camera)
        const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)

        const animate = function (time: number) {
            control.update()
            renderMain(0)
            window.requestAnimationFrame(animate)
        }

        function renderMain(materialIndex: number) {
            gl.useProgram(mainProgram)
            gl.enable(gl.DEPTH_TEST)
            gl.depthMask(true)
            gl.depthFunc(gl.LEQUAL)
            gl.clearColor(0.0, 0.0, 0.0, 1)
            gl.clearDepth(1.0)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

            {
                // 全局uniform --- 相机
                gl.uniformMatrix4fv(main_cameraProjectionLocation, false, camera.cameraProjectionMatrix)
                gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, camera.cameraViewMatrix)
                // 全局uniform --- 视角
                // gl.uniform3f(main_uViewPosition, 1.0, 1.0, 1.0)
                gl.uniform3f(
                    main_uViewPosition,
                    camera.getPosition()[0],
                    camera.getPosition()[1],
                    camera.getPosition()[2],
                )

                // 全局uniform --- 光照
                gl.uniform3f(main_uLightPosition, light.position[0], light.position[1], light.position[2])
                // gl.uniform3f(main_uLightColor, light.color[0], light.color[1], light.color[2])
                gl.uniform3f(main_uLightAmbient, light.ambient[0], light.ambient[1], light.ambient[2])
                gl.uniform3f(main_uLightDiffuse, light.diffuse[0], light.diffuse[1], light.diffuse[2])
                gl.uniform3f(main_uLightSpecular, light.specular[0], light.specular[1], light.specular[2])

                // 全局uniform --- 材质
                gl.uniform1f(main_uMaterialShininess, materialPhongs[materialIndex].shininess * 128)
                // gl.uniform1f(main_uMaterialShininess, 32)
                gl.uniform3f(
                    main_uMaterialAmbient,
                    materialPhongs[materialIndex].ambient[0],
                    materialPhongs[materialIndex].ambient[1],
                    materialPhongs[materialIndex].ambient[2],
                )
                gl.uniform3f(
                    main_uMaterialDiffuse,
                    materialPhongs[materialIndex].diffuse[0],
                    materialPhongs[materialIndex].diffuse[1],
                    materialPhongs[materialIndex].diffuse[2],
                )
                gl.uniform3f(
                    main_uMaterialSpecular,
                    materialPhongs[materialIndex].specular[0],
                    materialPhongs[materialIndex].specular[1],
                    materialPhongs[materialIndex].specular[2],
                )

                models.forEach(({name, color, isLight, vao, attributes, indexLength, objectModelMatrix}) => {
                    gl.bindVertexArray(vao)

                    gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
                    gl.uniform3f(main_modelColor, color[0], color[1], color[2])
                    gl.uniform1f(main_uIsLight, isLight ? 1 : 0)

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.index_buffer)
                    gl.drawElements(gl.TRIANGLES, indexLength, gl.UNSIGNED_SHORT, 0)

                    gl.bindVertexArray(null)
                })
            }
        }

        animate(0)

        window?.addEventListener('resize', () => {
            canvas.width = element?.clientWidth! | window.innerWidth
            canvas.height = element?.clientHeight! | window.innerHeight
            camera.updateProjectionMatrix(Math.PI / 4, canvas.width / canvas.height, 1, 100)
        })
    })
    return <div id="container"></div>
}

export {Light6}

function invert(out: Float32Array, a: Float32Array) {
    const a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3]
    const a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7]
    const a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11]
    const a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15]

    const b00 = a00 * a11 - a01 * a10
    const b01 = a00 * a12 - a02 * a10
    const b02 = a00 * a13 - a03 * a10
    const b03 = a01 * a12 - a02 * a11
    const b04 = a01 * a13 - a03 * a11
    const b05 = a02 * a13 - a03 * a12
    const b06 = a20 * a31 - a21 * a30
    const b07 = a20 * a32 - a22 * a30
    const b08 = a20 * a33 - a23 * a30
    const b09 = a21 * a32 - a22 * a31
    const b10 = a21 * a33 - a23 * a31
    const b11 = a22 * a33 - a23 * a32

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06

    if (!det) {
        return null
    }
    det = 1.0 / det

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det

    return out
}
