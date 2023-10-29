/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube, createPlane, createShape} from '../data'
import {WGLUtil, OrbitControl, PerspectiveCamera, Camera} from 'cat'

/**
// gl.enable(gl.STENCIL_TEST)
// 0xFF == 0b11111111, 此时，模板值与它进行按位与运算结果是模板值，模板缓冲可写
// 0x00 == 0b00000000 == 0, 此时，模板值与它进行按位与运算结果是0，模板缓冲不可写
// gl.stencilMask(0xff)
// gl.stencilFunc(gl.EQUAL, 1, 0xff) // 只描述了OpenGL对模板缓冲做什么
// gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE) // 描述我们如何更新缓冲
 */
function StencilDemo(): JSX.Element {
    useEffect(() => {
        const element = document.getElementById('container')
        const canvas = document.createElement('canvas')
        element?.appendChild(canvas)
        canvas.className = 'canvas'
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const gl = canvas.getContext('webgl2', {stencil: true})!
        const models: any[] = [
            {
                name: 'cube1',
                execute: createCube,
                color: [1, 0, 0],
                castShadow: true,
                writeStencil: true,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -0.6, 0, 1]),
                scaledObjectModelMatrix: new Float32Array([1.1, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 1.1, 0, 0, -0.6, 0, 1]),
            },
            {
                name: 'cube2',
                execute: createCube,
                color: [1, 0, 0],
                castShadow: true,
                writeStencil: true,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.6, 0, 1]),
                scaledObjectModelMatrix: new Float32Array([1.1, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 1.1, 0, 0, 0.6, 0, 1]),
            },
            {
                name: 'cubeLight',
                execute: createCube,
                color: [1, 1, 1],
                castShadow: true,
                writeStencil: false,
                objectModelMatrix: new Float32Array([0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]),
                scaledObjectModelMatrix: new Float32Array([0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]),
            },
            {
                name: 'plane',
                execute: createPlane,
                color: [1, 1, 0],
                castShadow: false,
                writeStencil: false,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
                scaledObjectModelMatrix: new Float32Array([0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]),
            },
        ].map(({name, color, castShadow, execute, objectModelMatrix, scaledObjectModelMatrix}) => {
            const {vertices, indices} = execute()
            const vertex_buffer = WGLUtil.createBufferAndBindData(
                gl,
                gl.ARRAY_BUFFER,
                new Float32Array(vertices),
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
                scaledObjectModelMatrix,
                castShadow,
                indexLength: indices.length,
                color,
                vao: null,
                attributes: {
                    vertex_buffer,
                    index_buffer,
                },
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
            out vec4 outColor;

            float linearDepth(float depth) {
                float near = 1.;
                float far = 10.;
                float ndcZ = depth * 2. - 1.;
                return (2.0 * near) / (far + near - ndcZ * (far - near));
            }
            
            void main(void) {
                outColor = vec4(u_Color, 1.0);
            }`

        const colorFragCode = `#version 300 es
            precision mediump float;
            out vec4 outColor;

            void main(void) {
                outColor = vec4(0.04, 0.28, 0.26, 1.0);
            }`

        const colorProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, colorFragCode)!
        const color_objectModelMatrixLocation = gl.getUniformLocation(colorProgram, 'model_uModelMatrix')
        const color_cameraProjectionLocation = gl.getUniformLocation(colorProgram, 'camera_uProjectionMatrix')
        const color_cameraViewMatrixLocation = gl.getUniformLocation(colorProgram, 'camera_uViewMatrix')

        const mainProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, mainFragCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')
        const main_modelColor = gl.getUniformLocation(mainProgram, 'u_Color')

        models.forEach(modelInfo => {
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)

            // 将buffer与着色器绑定
            gl.bindBuffer(gl.ARRAY_BUFFER, modelInfo.attributes.vertex_buffer)
            const main_Position = gl.getAttribLocation(mainProgram, 'position')
            gl.vertexAttribPointer(main_Position, 3, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(main_Position)
            // gl.bindBuffer(gl.ARRAY_BUFFER, null)
            gl.bindVertexArray(null)

            modelInfo.vao = vao
        })

        const camera = new PerspectiveCamera(Math.PI / 4, canvas.width / canvas.height, 1, 10)
        const control = new OrbitControl(canvas, camera)
        const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)

        const animate = function (time: number) {
            control.update()
            renderMain()
            window.requestAnimationFrame(animate)
        }

        function renderMain() {
            // gl.enable(gl.DEPTH_TEST)
            // gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)
            // gl.depthMask(true)
            // gl.depthFunc(gl.LEQUAL)
            // gl.clearDepth(1.0)

            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            gl.clearColor(0.0, 0.0, 0.0, 1)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)

            {
                gl.useProgram(mainProgram)
                gl.enable(gl.DEPTH_TEST)
                gl.disable(gl.STENCIL_TEST)
                // 绘制光、底面
                ;[models[2], models[3]].forEach(({name, color, vao, attributes, indexLength, objectModelMatrix}) => {
                    gl.bindVertexArray(vao)

                    gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
                    gl.uniformMatrix4fv(main_cameraProjectionLocation, false, camera.cameraProjectionMatrix)
                    gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, camera.cameraViewMatrix)
                    gl.uniform3f(main_modelColor, color[0], color[1], color[2])

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.index_buffer)
                    gl.drawElements(gl.TRIANGLES, indexLength, gl.UNSIGNED_SHORT, 0)

                    gl.bindVertexArray(null)
                })

                // 绘制模型， 更新stencil buffer
                gl.enable(gl.STENCIL_TEST)
                // gl.stencilMask(0xff)
                // 只描述了OpenGL对模板缓冲做什么 (模版测试比较函数，模版测试的参考值，指定操作掩码)
                gl.stencilFunc(gl.ALWAYS, 1, 0xff)
                // 描述我们如何更新缓冲 (模版不通过时的行为，模版通过深度未通过时的行为，模版通过深度通过时的行为)
                gl.stencilOp(gl.KEEP, gl.REPLACE, gl.REPLACE)
                // gl.stencilMask(0xff)
                ;[models[0], models[1]].forEach(({color, vao, attributes, indexLength, objectModelMatrix}) => {
                    gl.bindVertexArray(vao)

                    gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
                    gl.uniformMatrix4fv(main_cameraProjectionLocation, false, camera.cameraProjectionMatrix)
                    gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, camera.cameraViewMatrix)
                    gl.uniform3f(main_modelColor, color[0], color[1], color[2])

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.index_buffer)
                    gl.drawElements(gl.TRIANGLES, indexLength, gl.UNSIGNED_SHORT, 0)

                    gl.bindVertexArray(null)
                })

                // 使用stencil buffer进行测试
                gl.stencilFunc(gl.NOTEQUAL, 1, 0xff)
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
                gl.disable(gl.DEPTH_TEST)
                gl.useProgram(colorProgram)
                ;[models[0], models[1]].forEach(({vao, attributes, indexLength, scaledObjectModelMatrix}) => {
                    gl.bindVertexArray(vao)

                    gl.uniformMatrix4fv(color_objectModelMatrixLocation, false, scaledObjectModelMatrix)
                    gl.uniformMatrix4fv(color_cameraProjectionLocation, false, camera.cameraProjectionMatrix)
                    gl.uniformMatrix4fv(color_cameraViewMatrixLocation, false, camera.cameraViewMatrix)

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.index_buffer)
                    gl.drawElements(gl.TRIANGLES, indexLength, gl.UNSIGNED_SHORT, 0)

                    gl.bindVertexArray(null)
                })

                // gl.stencilMask(0xff)
                // gl.stencilFunc(gl.ALWAYS, 1, 0xff)
                gl.enable(gl.DEPTH_TEST)
                gl.disable(gl.STENCIL_TEST)
            }
        }

        animate(0)

        window?.addEventListener('resize', () => {
            canvas.width = element?.clientWidth! | window.innerWidth
            canvas.height = element?.clientHeight! | window.innerHeight
            camera.updateProjectionMatrix(Math.PI / 4, canvas.width / canvas.height, 1, 10)
        })
    })
    return <div id="container"></div>
}

export {StencilDemo}

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
