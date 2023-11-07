/* eslint-disable prettier/prettier */
/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube2, createPlane2} from '../data'
import {Geometry, Model, WGLUtil, OrbitControl, PerspectiveCamera, ColorMaterial, Attribute} from 'cat'
/*
 * Note: 
 * 先将场景渲染到缓冲区（纹理使用外部纹理）， 再将Framebuffer中的COLOR_ATTACHMENT0 作为材质的纹理，渲染到屏幕
 * 
 */
function FramebufferDemo(): JSX.Element {
    useEffect(() => {
        const pngUrl = './img/container2.png'
        loadImage(pngUrl).then(png => {
            executeTask(png)
        })
    })

    const createFb = (gl: WebGL2RenderingContext) => {
        /*
            建构一个完整的帧缓冲必须满足以下条件：
                - 我们必须往里面加入至少一个附件（颜色、深度、模板缓冲）。
                - 其中至少有一个是颜色附件。
                - 所有的附件都应该是已经完全做好的（已经存储在内存之中）。
                - 每个缓冲都应该有同样数目的样本。
        */
        const framebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
        const width = window.innerWidth
        const height = window.innerHeight
        

        // 绑定纹理附件
        {
            /*
                glFramebufferTexture2D函数需要传入下列参数：
                    - target：我们所创建的帧缓冲类型的目标（绘制、读取或两者都有）。
                    - attachment：我们所附加的附件的类型。现在我们附加的是一个颜色附件。需要注意，最后的那个0是暗示我们可以附加1个以上颜色的附件。我们会在后面的教程中谈到。
                    - textarget：你希望附加的纹理类型。
                    - texture：附加的实际纹理。
                    - level：Mipmap level。我们设置为0。
            */
            const colorTexture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, colorTexture)
            // 对于这个纹理，我们只分配内存，而不去填充它, 纹理填充会在渲染到帧缓冲的时候去做
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.bindTexture(gl.TEXTURE_2D, null);
            (framebuffer as any)._texture = colorTexture
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0)

            // 创建渲染缓冲对象
            // const depthBuffer = gl.createRenderbuffer()
            // gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
            // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
            // gl.bindRenderbuffer(gl.RENDERBUFFER, null)
            // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)


            // 可以将深度纹理 和 模版纹理绑定给帧缓冲区
            // const depthTexture = gl.createTexture()
            // gl.bindTexture(gl.TEXTURE_2D, depthTexture)
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH, gl.UNSIGNED_BYTE, null)
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)

            // const stencilTexture = gl.createTexture()
            // gl.bindTexture(gl.TEXTURE_2D, stencilTexture)
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.STENCIL_INDEX8, width, height, 0, gl.STENCIL, gl.UNSIGNED_BYTE, null)
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, stencilTexture, 0)

            
            // 也可以将深度缓冲和模版缓冲会知道一个单独纹理上, 纹理的每32位数值就包含了24位的深度信息和8位的模板信息
            // const depthStencilTexture = gl.createTexture()
            // gl.bindTexture(gl.TEXTURE_2D, depthStencilTexture)
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH24_STENCIL8, width, height, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null)
            // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, depthStencilTexture, 0)
        }

        /*
         添加缓冲对象附件， 缓冲对象一堆字节、整数、像素或者其他东西
            - 它的优势是以原生渲染格式储存它的数据，因此在离屏渲染到帧缓冲的时候，这些数据就相当于被优化过的
            - 渲染缓冲对象通常是只写的，不能修改它们（就像获取纹理，不能写入纹理一样）
            - 可以用glReadPixels函数去读取，函数返回一个当前绑定的帧缓冲的特定像素区域，而不是直接返回附件本身
        */
        {
            // 它们经常作为深度和模板附件来使用, 我们不需要从深度和模板缓冲中读取数据，但仍关心深度和模板测试。我们就需要有深度和模板值提供给测试，但不需要对这些值进行采样（sample），所以深度缓冲对象是完全符合的
            // const renderBuffer = gl.createRenderbuffer();
            // gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
            // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height);
            // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
            // gl.bindRenderbuffer(gl.RENDERBUFFER, null)

            /*
                如何选择是使用渲染缓冲还是纹理作为附件呢
                - 如果你永远都不需要从特定的缓冲中进行采样，渲染缓冲对象对特定缓冲是更明智的选择
                - 如果需要从比如颜色或深度值这样的特定缓冲采样数据的话，你最好还是使用纹理附件
            */
        }

        // 检查当前绑定的帧缓冲是否初始化成功
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
            console.log('framebuffer init success')
        } else {
            console.log('framebuffer init failed')
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null) // 表示绑定默认缓冲
        return framebuffer
    }

    const createModels = (img: HTMLImageElement | undefined) => {
        const models = [];
    
        {
            // 创建地面
            const planeVertex = createPlane2()
            const planeGeometry = new Geometry({
                position: {
                    data: new Float32Array(planeVertex),
                    size: 3,
                    offset: 0,
                    stride: (3 + 3 + 2) * 4
                }
            })
            planeGeometry.vertexCount = planeVertex.length / 8
            const planeMaterial =  new ColorMaterial([1, 1, 0])
            const planeModel = new Model(planeGeometry, planeMaterial)
            models.push(planeModel);
        }

        {
            // 创建立方体模型
            const cubeVertex = createCube2()
            const cubeGeometry = new Geometry({
                position: {
                    data: new Float32Array(cubeVertex),
                    size: 3,
                    offset: 0,
                    stride: (3 + 3 + 2) * 4
                },
                uv: {
                    data: new Float32Array(cubeVertex),
                    size: 2,
                    offset: (3 + 3) * 4,
                    stride: (3 + 3 + 2) * 4
                },
            })
            cubeGeometry.vertexCount = cubeVertex.length / 8

            const cubeMaterial1 =  new ColorMaterial([1, 0, 0])
            const cubeModel1 = new Model(cubeGeometry, cubeMaterial1)
            cubeModel1.modelMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.6, -0.5, 0, 1]
            models.push(cubeModel1);

            const cubeMaterial2 =  new ColorMaterial([0, 1, 0], img)
            const cubeModel2 = new Model(cubeGeometry, cubeMaterial2)
            cubeModel2.modelMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.6, 0.6, 0, 1]
            models.push(cubeModel2);

            // 创建立方体灯光模型
            const cubeLightMaterial =  new ColorMaterial([1, 1, 1])
            const cubeLightModel = new Model(cubeGeometry, cubeLightMaterial)
            cubeLightModel.modelMatrix = [0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]
            models.push(cubeLightModel);
        }
        return models
    }

    const executeTask = (img: HTMLImageElement | undefined) => {
        const element = document.getElementById('container')
        const canvas = document.createElement('canvas')
        element?.appendChild(canvas)
        canvas.className = 'canvas'
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const gl = canvas.getContext('webgl2')!

        const models = createModels(img)
        const material = new ColorMaterial([1, 1, 1, 1])

        // 编译material 
        const mainProgram = WGLUtil.createProgramFromSources(gl, material.vsCode, material.fsCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')
        const main_materialColor = gl.getUniformLocation(mainProgram, 'material_uColor')
        const main_materialTexture = gl.getUniformLocation(mainProgram, 'material_uTexture')
        const main_materialIsTexture = gl.getUniformLocation(mainProgram, 'material_uIsTexture')

        // 处理材质中的纹理对象
        const materialWithTexture = models.filter(model => (model.material as ColorMaterial).map !== undefined).map(model => model.material)[0] as ColorMaterial;
        const materialTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, materialTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  materialWithTexture.map as HTMLImageElement)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null)
        // ;(materialWithTexture as any)._texture = materialTexture

        // 创建Framebuffer
        const framebuffer = createFb(gl);

        // 创建并绑定buffer、 vao
        const renderModelInfos = models.map((model: Model) => {
            const attributes = [];
            model.geometry.attributes.position && attributes.push(model.geometry.attributes.position)
            model.geometry.attributes.uv && attributes.push(model.geometry.attributes.uv)

            // TODO: 这里有重复创建，需要考虑
            const attributeWithBuffers = attributes.map(attribute => ({attribute, buffer: WGLUtil.createBufferAndBindData(gl, gl.ARRAY_BUFFER, attribute.data, gl.STATIC_DRAW)}));
            const bufferNames = ['position', 'uv'];
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)
            // 将buffer与着色器绑定
            attributeWithBuffers.forEach(({attribute, buffer}, index) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                const main_Vertex = gl.getAttribLocation(mainProgram, bufferNames[index])
                gl.vertexAttribPointer(main_Vertex, attribute.size, gl.FLOAT, false, attribute.stride, attribute.offset)
                gl.enableVertexAttribArray(main_Vertex)
                gl.bindBuffer(gl.ARRAY_BUFFER, null)
            });
            gl.bindVertexArray(null)
            
            return {vao,  model}
        })

        const camera = new PerspectiveCamera(Math.PI / 4, canvas.width / canvas.height, 1, 100)
        const control = new OrbitControl(canvas, camera)
        const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)

        const animate = function () {
            control.update()
            // 将图片纹理渲染到framebuffer上
            render(framebuffer as WebGLFramebuffer, materialTexture as WebGLTexture);
            // 将framebuffer的渲染到canvas上
            render(null, (framebuffer as any)._texture as WebGLTexture);
            window.requestAnimationFrame(animate)
        }

        function render(fb: WebGLFramebuffer | null, texture: WebGLTexture) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            gl.useProgram(mainProgram)
            gl.enable(gl.DEPTH_TEST)
            gl.depthMask(true)
            gl.depthFunc(gl.LEQUAL)
            gl.clearColor(0.0, 0.0, 0.0, 1)
            gl.clearDepth(1.0)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            
            {
                gl.activeTexture(gl.TEXTURE0 + 0)
                gl.bindTexture(gl.TEXTURE_2D, texture)

                // 全局uniform --- 相机
                gl.uniformMatrix4fv(main_cameraProjectionLocation, false, camera.cameraProjectionMatrix)
                gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, camera.cameraViewMatrix)
                gl.uniform1i(main_materialTexture, 0) // 纹理单元 0

                // 全局uniform --- 材质
                renderModelInfos.forEach(({vao, model}) => {
                    const objectModelMatrix = model.modelMatrix;
                    const color = (model.material as ColorMaterial).color;
                    const useMap = (model.material as ColorMaterial).map ? 1 : 0
                    const pointCount = model.geometry.vertexCount

                    gl.bindVertexArray(vao)
                    gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
                    
                    gl.uniform1f(main_materialIsTexture, useMap)
                    gl.uniform1i(main_materialTexture, 0)
                    gl.uniform3f(main_materialColor, color[0], color[1], color[2])
                    gl.drawArrays(gl.TRIANGLES, 0, pointCount)

                    gl.bindVertexArray(null)
                })

                gl.bindTexture(gl.TEXTURE_2D, null)
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        animate()

        window?.addEventListener('resize', () => {
            canvas.width = element?.clientWidth! | window.innerWidth
            canvas.height = element?.clientHeight! | window.innerHeight
            camera.updateProjectionMatrix(Math.PI / 4, canvas.width / canvas.height, 1, 100)
        })
    }
    return <div id="container"></div>
}

export {FramebufferDemo}

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
