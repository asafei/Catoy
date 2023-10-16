/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube, createPlane} from '../data'
import {WGLUtil, OrbitControl, PerspectiveCamera} from 'cat'

/**
 * 使用webgl2
 * phong 光照模型
 */
function Light4(): JSX.Element {
    useEffect(() => {
        const element = document.getElementById('container')
        const canvas = document.createElement('canvas')
        element?.appendChild(canvas)
        canvas.className = 'canvas'
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const gl = canvas.getContext('webgl2')!
        const models: any[] = [
            {
                name: 'cube',
                execute: createCube,
                color: [1, 0, 0],
                isLight: false,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
            {
                name: 'cubeLight',
                execute: createCube,
                color: [1, 1, 1],
                isLight: true,
                objectModelMatrix: new Float32Array([0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]),
            },
            {
                name: 'plane',
                execute: createPlane,
                color: [1, 1, 0],
                isLight: false,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
        ].map(({name, color, isLight, execute, objectModelMatrix}) => {
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
            // 计算环境光
            uniform float u_AmbientLightStrength;
            uniform vec3 u_AmbientLightColor;
            // 计算漫反射
            uniform vec3 u_DiffuseLightPosition;
            uniform vec3 u_DiffuseLightColor;
            // 计算镜面反射
            uniform vec3 u_viewPosition;
            uniform float u_SpecularLightStrength;
            uniform vec3 u_SpecularLightColor;
            // 值越大，高光点越小
            uniform float u_SpecularLightShininess;


            
            // uniform vec3 u_lightPosition
            // uniform vec3 u_lightColor;
            out vec4 outColor;

            
            void main(void) {
                // outColor = vec4(vNormal * 0.5 + 0.5, 1.0);
                // outColor = vec4(vNormal, 1.0);
                if(u_IsLight > 0.0){
                    outColor = vec4(u_Color, 1.0);
                } else{
                    vec3 ambient = u_AmbientLightStrength * u_AmbientLightColor;

                    // 计算漫反射
                    vec3 lightDir = normalize(u_DiffuseLightPosition - vFragPos);
                    float diff = max(dot(vNormal, lightDir), 0.0);
                    vec3 diffuse = diff * u_DiffuseLightColor;

                    // 计算镜面反射
                    vec3 viewDir = normalize(u_viewPosition - vFragPos);
                    vec3 reflectDir = reflect(-lightDir, vNormal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_SpecularLightShininess);
                    vec3 specular = u_SpecularLightStrength * spec * u_SpecularLightColor;

                    vec3 color = u_Color * (ambient + diffuse + specular);
                    outColor = vec4(color, 1.0);
                }
            }`

        const mainProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, mainFragCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')
        const main_modelColor = gl.getUniformLocation(mainProgram, 'u_Color')

        const main_uIsLight = gl.getUniformLocation(mainProgram, 'u_IsLight')
        const main_uAmbientLightStrength = gl.getUniformLocation(mainProgram, 'u_AmbientLightStrength')
        const main_uAmbientLightColor = gl.getUniformLocation(mainProgram, 'u_AmbientLightColor')
        const main_uDiffuseLightPosition = gl.getUniformLocation(mainProgram, 'u_DiffuseLightPosition')
        const main_uDiffuseLightColor = gl.getUniformLocation(mainProgram, 'u_DiffuseLightColor')
        const main_uSpecularLightStrength = gl.getUniformLocation(mainProgram, 'u_SpecularLightStrength')
        const main_uSpecularLightShininess = gl.getUniformLocation(mainProgram, 'u_SpecularLightShininess')
        const main_uSpecularLightColor = gl.getUniformLocation(mainProgram, 'u_SpecularLightColor')
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
            renderMain()
            window.requestAnimationFrame(animate)
        }

        function renderMain() {
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

                // 全局uniform --- 光照
                gl.uniform1f(main_uAmbientLightStrength, 0.1)
                gl.uniform3f(main_uAmbientLightColor, 1.0, 1.0, 1.0)
                gl.uniform3f(main_uDiffuseLightPosition, 1.0, 1.0, 1.0)
                gl.uniform3f(main_uDiffuseLightColor, 1.0, 1.0, 1.0)

                gl.uniform3f(main_uSpecularLightColor, 1.0, 1.0, 1.0)
                gl.uniform3f(main_uViewPosition, 1.0, 1.0, 1.0)
                gl.uniform1f(main_uSpecularLightStrength, 0.5)
                gl.uniform1f(main_uSpecularLightShininess, 32.0)

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

export {Light4}

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
