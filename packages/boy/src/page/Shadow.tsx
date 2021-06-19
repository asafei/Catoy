/** @format */

import React, {useEffect} from 'react'
import '../css/index.css'
import {createShape} from './data'
import {WGLUtil, OrbitControl, PerspectiveCamera, Camera} from 'cat'

function Shadow() {
    useEffect(() => {
        const element = document.getElementById('container')
        const canvas = document.createElement('canvas')
        element?.appendChild(canvas)
        canvas.className = 'canvas'
        canvas.width = element?.clientWidth! | window.innerWidth
        canvas.height = element?.clientHeight! | window.innerHeight

        const gl = canvas.getContext('webgl')!
        const {vertices, indices, normals, uvs} = createShape()
        console.log('vertices', vertices)

        // 将数据绑定到buffer
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

        // TODO:归到material
        const mainVertCode =
            'attribute vec3 position;\n' +
            'attribute vec3 normal;\n' +
            'uniform mat4 camera_uProjectionMatrix;\n' +
            'uniform mat4 camera_uViewMatrix;\n' +
            'uniform mat4 model_uModelMatrix;\n' +
            'varying vec3 vNormal;\n' +
            'void main(void) { \n' +
            'vNormal = normal;\n' +
            'vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);\n' +
            'gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;\n' +
            '}'

        const mainFragCode =
            'precision mediump float;\n' +
            'varying vec3 vNormal;\n' +
            'void main(void) {\n' +
            'gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);\n' +
            '}'

        const mainProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, mainFragCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')

        // 将buffer与着色器绑定
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        const main_Position = gl.getAttribLocation(mainProgram, 'position')
        gl.vertexAttribPointer(main_Position, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(main_Position)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer)
        const main_Normal = gl.getAttribLocation(mainProgram, 'normal')
        gl.vertexAttribPointer(main_Normal, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(main_Normal)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        const camera = new Camera()
        const control = new OrbitControl(canvas, camera)

        let perspectiveProjectionMatrix = PerspectiveCamera.getPerspectiveProjection(
            Math.PI / 4,
            canvas.width / canvas.height,
            1,
            100,
        )
        const objectModelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])

        const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)
        // var cameraViewMatrix = new Float32Array(16);
        // invert(cameraViewMatrix, cameraModelMatrix);

        // // this ortho size should be adjusted to ths scene bounding box
        // var orthoProjection = getOrthoProjection(-5, 5, -5, 5, -5, 5);
        // // this light view matrix is linked to direction [1, 1, 1]
        // var lightViewMatrix = new Float32Array([
        //     -0.7071067690849304, -0.40824830532073975, 0.5773501992225647, 0,
        //     0.7071067690849304, -0.40824833512306213, 0.5773502588272095, 0,
        //     0, 0.8164965510368347, 0.5773503184318542, 0,
        //     0, 0, 0, 1
        // ]);

        let time_old = 0
        const animate = function (time: number) {
            const dt = time - time_old
            control.update()

            time_old = time

            gl.useProgram(mainProgram)
            gl.enable(gl.DEPTH_TEST)
            gl.depthMask(true)
            gl.depthFunc(gl.LEQUAL)
            gl.clearColor(0.8, 0.6, 0.9, 1)
            gl.clearDepth(1.0)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            // console.log(canvas.width,canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

            gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
            gl.uniformMatrix4fv(main_cameraProjectionLocation, false, perspectiveProjectionMatrix)
            gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, camera.cameraViewMatrix)

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

            window.requestAnimationFrame(animate)
        }

        animate(0)

        window?.addEventListener('resize', event => {
            console.log(event)
            // 需要时刻监听canvas的尺寸变化，影响到投影矩阵，可以限制在camera内部
            canvas.width = element?.clientWidth! | window.innerWidth
            canvas.height = element?.clientHeight! | window.innerHeight
            perspectiveProjectionMatrix = PerspectiveCamera.getPerspectiveProjection(
                Math.PI / 4,
                canvas.width / canvas.height,
                1,
                100,
            )
        })
    })
    return <div id="container"></div>
}

export {Shadow}

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
