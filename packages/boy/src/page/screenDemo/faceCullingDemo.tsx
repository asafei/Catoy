/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube2, createPlane2, createPlane3} from '../data'
import {WGLUtil, OrbitControl, PerspectiveCamera} from 'cat'
/*
gl.enable(gl.CULL_FACE)

glCullFace函数有三个可用的选项：
• GL_BACK：只剔除背面。
• GL_FRONT：只剔除正面。
• GL_FRONT_AND_BACK：剔除背面和正面。

还可以告诉OpenGL使用顺时针而不是逆时针来表示正面
* glFrontFace(GL_CCW); 设置逆时针为正面
*/
function FaceCullingDemo(): JSX.Element {
    useEffect(() => {
        executeTask()
    })

    const executeTask = () => {
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
                name: 'plane',
                execute: createPlane2,
                color: [1, 1, 0],
                isLight: true,
                pointCount: 6,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
            {
                name: 'cube',
                execute: createCube2,
                color: [1, 0, 0],
                isLight: false,
                pointCount: 36,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
            {
                name: 'plane1',
                execute: createPlane3,
                color: [1, 0, 0],
                isLight: false,
                pointCount: 6,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.6, 0.2, 0, 1]),
            },
            {
                name: 'plane2',
                execute: createPlane3,
                color: [1, 0, 0],
                isLight: false,
                pointCount: 6,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.6, 0.6, 0, 1]),
            },
            {
                name: 'cubeLight',
                execute: createCube2,
                color: light.color,
                isLight: true,
                pointCount: 36,
                objectModelMatrix: new Float32Array([0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]),
            },
        ].map(({name, color, isLight, pointCount, execute, objectModelMatrix}) => {
            const attributeData = execute()
            const attribute_buffer = WGLUtil.createBufferAndBindData(
                gl,
                gl.ARRAY_BUFFER,
                new Float32Array(attributeData),
                gl.STATIC_DRAW,
            )

            return {
                name,
                objectModelMatrix,
                isLight,
                pointCount,
                color,
                vao: null,
                attributes: {buffer: attribute_buffer},
            }
        })

        // {
        // 主shader
        const mainVertCode = `#version 300 es
            in vec3 position;

            uniform mat4 camera_uProjectionMatrix;
            uniform mat4 camera_uViewMatrix;
            uniform mat4 model_uModelMatrix;

            void main(void) { 
                vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
                gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
            }`
        const mainFragCode = `#version 300 es
            precision mediump float;
            uniform vec3 u_Color;
            uniform float u_IsLight;
            out vec4 outColor;

            void main(void) {
                if(u_IsLight > 0.0){
                    outColor = vec4(u_Color, 1.0);
                } else{
                    outColor = vec4(u_Color, 1.0);

                }
            }`

        const mainProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, mainFragCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')
        const main_modelColor = gl.getUniformLocation(mainProgram, 'u_Color')
        const main_uIsLight = gl.getUniformLocation(mainProgram, 'u_IsLight')

        models.forEach(modelInfo => {
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)

            // 将buffer与着色器绑定
            gl.bindBuffer(gl.ARRAY_BUFFER, modelInfo.attributes.buffer)
            const main_Position = gl.getAttribLocation(mainProgram, 'position')
            gl.vertexAttribPointer(main_Position, 3, gl.FLOAT, false, 32, 0)
            gl.enableVertexAttribArray(main_Position)
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
            gl.enable(gl.CULL_FACE)
            gl.cullFace(gl.BACK) // 剔除背面
            gl.frontFace(gl.CCW) // 设置逆时针为正面

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

                // 全局uniform --- 材质

                models.forEach(({name, color, isLight, vao, pointCount, objectModelMatrix}) => {
                    gl.bindVertexArray(vao)

                    gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
                    gl.uniform3f(main_modelColor, color[0], color[1], color[2])
                    gl.uniform1f(main_uIsLight, isLight ? 1 : 0)

                    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.index_buffer)
                    // gl.drawElements(gl.TRIANGLES, indexLength, gl.UNSIGNED_SHORT, 0)
                    gl.drawArrays(gl.TRIANGLES, 0, pointCount)

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
    }
    return <div id="container"></div>
}

export {FaceCullingDemo}

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
function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = url
        image.crossOrigin = 'anonymous'
        image.addEventListener('load', () => {
            console.log('image load success！')
            resolve(image)
        })
    })
}
