/** @format */

import React, {useEffect} from 'react'
import '../css/index.css'
import {createShape} from './data'
import {WGLUtil, OrbitControl, PerspectiveCamera, Camera, OrthoCamera} from 'cat'

/**
 * 原理
 * 1、获取光源为相机时的深度图depthMap
 * 2、在正常相机视角下获取可视点的深度值depthEye，同时获取可视点在光源坐标下的深度值depthLight；错
 * 2、在正常相机视角下获取可视点p，计算p在光照坐标下的深度值depthMy，同时获取p对应的uv坐标处的深度值depthUV
 * 3、比较depthEye和depthLight，若depthEye<depthLight则该点无阴影，否则则处于阴影区
 * 4、针对阴影区的地方需要特殊处理
 *
 * ext，波纹情况需要处理；
 */
function ShadowTest() {
    useEffect(() => {
        // const viewer = new Viewr();
        // viewer.render();
        // (window as any).viewer = viewer;

        const element = document.getElementById('container')
        const canvas = document.createElement('canvas')
        element?.appendChild(canvas)
        canvas.className = 'canvas'
        // webgl1 这里是关键
        canvas.width = 512
        canvas.height = 512
        // canvas.width = element?.clientWidth! | window.innerWidth
        // canvas.height = element?.clientHeight! | window.innerHeight

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

        // {
        // 测试阴影
        const lightVertCode =
            'attribute vec3 position;\n' +
            'uniform mat4 camera_uProjectionMatrix;\n' +
            'uniform mat4 camera_uViewMatrix;\n' +
            'uniform mat4 model_uModelMatrix;\n' +
            'void main(void) { \n' +
            'vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);\n' +
            'gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;\n' +
            '}'

        const lightFragCode = `precision mediump float;
            vec4 pack (float depth) {
                const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
                const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
                vec4 rgbaDepth = fract(depth * bitShift); 
                rgbaDepth -= rgbaDepth.gbaa * bitMask;
                return rgbaDepth;
            }
        void main(void) {
            gl_FragColor = pack(gl_FragCoord.z);
            // gl_FragColor = vec4(gl_FragCoord.zzz,1.0);
        }`

        const lightProgram = WGLUtil.createProgramFromSources(gl, lightVertCode, lightFragCode)!
        const light_objectModelMatrixLocation = gl.getUniformLocation(lightProgram, 'model_uModelMatrix')
        const light_cameraProjectionLocation = gl.getUniformLocation(lightProgram, 'camera_uProjectionMatrix')
        const light_cameraViewMatrixLocation = gl.getUniformLocation(lightProgram, 'camera_uViewMatrix')

        // 将buffer与着色器绑定
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        const light_Position = gl.getAttribLocation(lightProgram, 'position')
        gl.vertexAttribPointer(light_Position, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(light_Position)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        // }

        // {
        // 主shader
        const mainVertCode = `attribute vec3 position;
            attribute vec3 normal;
            uniform mat4 camera_uProjectionMatrix;
            uniform mat4 camera_uViewMatrix;
            uniform mat4 light_uProjectionMatrix;
            uniform mat4 light_uViewMatrix;
            uniform mat4 model_uModelMatrix;
            varying vec3 vNormal;
            varying vec4 vPositionInLight;
            void main(void) { 
                vNormal = normal;
                vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
                vPositionInLight = light_uProjectionMatrix * light_uViewMatrix * positionWorldSpace;
                gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
            }`
        const mainFragCode = `precision mediump float;
            varying vec3 vNormal;
            varying vec4 vPositionInLight;
            uniform sampler2D u_Sampler;
            float unpack(const in vec4 rgba) {
                const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
                return dot(rgba, bitShift);
            }
            
            void main(void) {
                vec3 shadowCoord = (vPositionInLight.xyz/vPositionInLight.w)/2.0 + 0.5;
                vec4 rgbaDepth = texture2D(u_Sampler, shadowCoord.xy);
                float depth = unpack(rgbaDepth);
                float visibility = (shadowCoord.z > depth + 0.005 ) ? 0.7: 1.0;
                vec4 color = vec4(vNormal * 0.5 + 0.5, 1.0);
                gl_FragColor = vec4(color.rgb * visibility, color.a);
            }`

        const mainProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, mainFragCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')
        const main_lightProjectionLocation = gl.getUniformLocation(mainProgram, 'light_uProjectionMatrix')
        const main_lightViewMatrixLocation = gl.getUniformLocation(mainProgram, 'light_uViewMatrix')
        const main_lightSampler = gl.getUniformLocation(mainProgram, 'u_Sampler')

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

        const fbObj = initFB(gl)
        const fb = fbObj.framebuffer
        const targetTexture = fbObj.texture

        // const targetTexture = gl.createTexture();
        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // //fb
        // const fb = gl.createFramebuffer();
        // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // }

        const camera = new Camera()
        const control = new OrbitControl(canvas, camera)
        const perspectiveProjectionMatrix = PerspectiveCamera.getPerspectiveProjection(
            Math.PI / 4,
            canvas.width / canvas.height,
            1,
            100,
        )
        const objectModelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
        const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)

        // // this ortho size should be adjusted to ths scene bounding box
        const orthoProjection = OrthoCamera.getOrthoProjection(-4, 4, -4, 4, -4, 4)
        // // this light view matrix is linked to direction [1, 1, 1]
        const lightViewMatrix = new Float32Array([
            -0.7071067690849304, -0.40824830532073975, 0.5773501992225647, 0, 0.7071067690849304, -0.40824833512306213,
            0.5773502588272095, 0, 0, 0.8164965510368347, 0.5773503184318542, 0, 0, 0, 0, 1,
        ])

        const animate = function (time: number) {
            control.update()

            renderShadowMap()
            renderMain()

            window.requestAnimationFrame(animate)
        }

        function renderMain() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)

            gl.useProgram(mainProgram)
            // 将纹理绑定到纹理单元上
            // gl.activeTexture(gl.TEXTURE0);
            // gl.bindTexture(gl.TEXTURE_2D, targetTexture)

            gl.enable(gl.DEPTH_TEST)
            gl.depthMask(true)
            gl.depthFunc(gl.LEQUAL)
            gl.clearColor(0.0, 1.0, 0.0, 1)
            gl.clearDepth(1.0)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

            gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
            gl.uniformMatrix4fv(main_cameraProjectionLocation, false, perspectiveProjectionMatrix)
            gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, camera.cameraViewMatrix)
            gl.uniformMatrix4fv(main_lightProjectionLocation, false, orthoProjection)
            gl.uniformMatrix4fv(main_lightViewMatrixLocation, false, lightViewMatrix)
            gl.uniform1i(main_lightSampler, 0)

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
            // gl.bindTexture(gl.TEXTURE_2D, null)
        }

        function renderShadowMap() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
            // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.useProgram(lightProgram)
            gl.enable(gl.DEPTH_TEST)
            gl.depthMask(true)
            gl.depthFunc(gl.LEQUAL)
            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.clearDepth(1.0)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

            gl.uniformMatrix4fv(light_objectModelMatrixLocation, false, objectModelMatrix)
            gl.uniformMatrix4fv(light_cameraProjectionLocation, false, orthoProjection)
            gl.uniformMatrix4fv(light_cameraViewMatrixLocation, false, lightViewMatrix)

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
        }

        animate(0)

        function initFB(gl: WebGLRenderingContext) {
            // 创建帧缓冲对象
            const framebuffer = gl.createFramebuffer()

            // 创建并设置纹理参数
            const texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, texture)
            // 务必2的次幂
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

            // 创建渲染缓冲对象
            const depthBuffer = gl.createRenderbuffer()
            gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height)

            // 将纹理贴图和渲染缓冲对象关联到FBO上
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

            // 检查FBO配置状态
            const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
            ;(framebuffer as any).texture = texture // 存一下纹理信息

            // 解绑缓存对象
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.bindTexture(gl.TEXTURE_2D, null)
            gl.bindRenderbuffer(gl.RENDERBUFFER, null)

            return {framebuffer, texture}
        }

        // window?.addEventListener('resize', event => {
        //     console.log(event)
        //     // 需要时刻监听canvas的尺寸变化，影响到投影矩阵，可以限制在camera内部
        //     canvas.width = element?.clientWidth! | window.innerWidth
        //     canvas.height = element?.clientHeight! | window.innerHeight
        //     perspectiveProjectionMatrix = PerspectiveCamera.getPerspectiveProjection(
        //         Math.PI / 4,
        //         canvas.width / canvas.height,
        //         1,
        //         100,
        //     )
        // })
    })
    return <div id="container"></div>
}

export {ShadowTest}

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
