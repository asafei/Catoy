/* eslint-disable prettier/prettier */
/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube2, createPlane2} from '../data'
import {Geometry, Model, WGLUtil, OrbitControl, PerspectiveCamera, ColorMaterial, Skybox, SkyboxMaterial} from 'cat'
/*
 * Note: 
 *  — 如果要先渲染物体，再渲染天空盒子，就能有些许的性能提升
 *      技巧： 将之前渲染
 *          —— 透视除法（perspective division）是在顶点着色器运行之后执行的，就是把gl_Position的xyz坐标除以w元素
 *          —— 强制skxybox的深度为1， gl_Position = pos.xyww, 这样片元着色器中skybox的所有深度都为1
 *          —— 然后修改深度方程，渲染skybox时，将默认的GL_LESS改为 GL_LEQUAL
 *          —— 如此就能先渲染物体再渲染skybox了
 * 
 */
function CubeMapDemo2(): JSX.Element {
    useEffect(() => {
        const pngUrl = './img/container2.png'
        const pngTask = loadImage(pngUrl);
        const cubeImageTasks = ['right','left','top','bottom','back','front'].map(face => loadImage(`./img/cube/cube1/${face}.jpg`));

        Promise.all([pngTask, Promise.all(cubeImageTasks)]).then(([pngImage, cubeImages]) => {
            executeTask(pngImage, cubeImages)
        });

    })

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

    const executeTask = (img: HTMLImageElement | undefined, cubeImages: HTMLImageElement[]) => {
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

        const skybox = new Skybox();
        const skyboxProgram = WGLUtil.createProgramFromSources(gl, skybox.material.vsCode, skybox.material.fsCode)!
        const skybox_objectModelMatrixLocation = gl.getUniformLocation(skyboxProgram, 'model_uModelMatrix')
        const skybox_cameraProjectionLocation = gl.getUniformLocation(skyboxProgram, 'camera_uProjectionMatrix')
        const skybox_cameraViewMatrixLocation = gl.getUniformLocation(skyboxProgram, 'camera_uViewMatrix')
        const skybox_materialColor = gl.getUniformLocation(skyboxProgram, 'material_uColor')
        const skybox_materialTexture = gl.getUniformLocation(skyboxProgram, 'material_uTexture')
        const skybox_materialIsTexture = gl.getUniformLocation(skyboxProgram, 'material_uIsTexture')

        const skyboxInfos = {} as any;
        {
            const attributes = [];
            skybox.geometry.attributes.position && attributes.push(skybox.geometry.attributes.position)

            // TODO: 这里有重复创建，需要考虑
            const attributeWithBuffers = attributes.map(attribute => ({attribute, buffer: WGLUtil.createBufferAndBindData(gl, gl.ARRAY_BUFFER, attribute.data, gl.STATIC_DRAW)}));
            const bufferNames = ['position', 'uv'];
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)
            // 将buffer与着色器绑定
            attributeWithBuffers.forEach(({attribute, buffer}, index) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                const skybox_Vertex = gl.getAttribLocation(skyboxProgram, bufferNames[index])
                gl.vertexAttribPointer(skybox_Vertex, attribute.size, gl.FLOAT, false, attribute.stride, attribute.offset)
                gl.enableVertexAttribArray(skybox_Vertex)
                gl.bindBuffer(gl.ARRAY_BUFFER, null)
            });
            gl.bindVertexArray(null)

            skyboxInfos.vao = vao
            skyboxInfos.model = skybox
        }
        



        // 创建cubemap纹理
        const cubeTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture)
        for(let i = 0; i < 6; i++) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, cubeImages[i].width, cubeImages[i].height, 0, gl.RGBA, gl.UNSIGNED_BYTE, cubeImages[i])
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
        // gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  , )
        // gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  , )
        // gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  , )
        // gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  , )
        // gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  , )
        // gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  , )


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

        const camera = new PerspectiveCamera(Math.PI / 4, canvas.width / canvas.height, 0.1, 100)
        const control = new OrbitControl(canvas, camera)
        // const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        const cameraModelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)

        const animate = function () {
            control.update()
            
            
            render(null, materialTexture as WebGLTexture, cubeTexture as WebGLTexture);
            renderSkybox()

            window.requestAnimationFrame(animate)
        }

        const viewMatrixWithoutOffset = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        function renderSkybox() {
            gl.useProgram(skyboxProgram)
            gl.enable(gl.DEPTH_TEST)
            gl.depthFunc(gl.LEQUAL)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)

            {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture)

                for(let i = 0; i< 12; i++){
                    viewMatrixWithoutOffset[i] = camera.cameraViewMatrix[i]
                }
                gl.uniformMatrix4fv(skybox_cameraProjectionLocation, false, camera.cameraProjectionMatrix)
                gl.uniformMatrix4fv(skybox_cameraViewMatrixLocation, false, viewMatrixWithoutOffset)
                gl.uniform1i(skybox_materialTexture, 0) // 纹理单元 0

                const objectModelMatrix = skybox.modelMatrix;
                const color = (skybox.material as SkyboxMaterial).color;
                // const useMap = (skybox.material as SkyboxMaterial).maps ? 1 : 0
                const useMap = 1
                const pointCount = skybox.geometry.vertexCount

                gl.bindVertexArray(skyboxInfos.vao)
                gl.uniformMatrix4fv(skybox_objectModelMatrixLocation, false, objectModelMatrix)
                
                gl.uniform1f(skybox_materialIsTexture, useMap)
                gl.uniform1i(skybox_materialTexture, 0)
                gl.uniform3f(skybox_materialColor, color[0], color[1], color[2])
                gl.drawArrays(gl.TRIANGLES, 0, pointCount)

                gl.bindVertexArray(null)

                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            
        }


        function render(fb: WebGLFramebuffer | null, texture: WebGLTexture, cubeTexture: WebGLTexture) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            gl.useProgram(mainProgram)
            gl.enable(gl.DEPTH_TEST)
            gl.depthFunc(gl.LESS)
            gl.clearColor(0.0, 0.0, 0.0, 1)
            gl.clearDepth(1.0)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            gl.clear(gl.DEPTH_BUFFER_BIT)
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

export {CubeMapDemo2}

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
