/* eslint-disable prettier/prettier */
/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube3, createPlane4} from '../data'
import {Geometry, Model, OrbitControl, PerspectiveCamera, ColorMaterial, PhongMaterial, Skybox, InstanceModel} from 'cat'
/*
 * Note: 
 *  — 将glDrawArrays和glDrawElements各自改为glDrawArraysInstanced和glDrawElementsInstanced
 *      - 用于实例化的函数版本需要设置一个额外的参数，叫做实例数量(Instance Count)
 *  - GLSL在着色器中嵌入了另一个内建变量，叫做gl_InstanceID。这个变量表示当前实例的索引，从0开始计数, 它在每个实例渲染时都会增加1
 *  - 
 *  - TODO: 当前一个shader配置了model_isInstancing, 另一个没配置，就会出现画不出的情况
 *   - 当获取一个不存在的location是，会返回null
 * 
 */
function InstanceDemo(): JSX.Element {
    useEffect(() => {
        const pngUrl = './img/container2.png'
        const pngTask = loadImage(pngUrl);
        const cubeImageTasks = ['right','left','top','bottom','back','front'].map(face => loadImage(`./img/cube/cube1/${face}.jpg`));

        Promise.all([pngTask, Promise.all(cubeImageTasks)]).then(([pngImage, cubeImages]) => {
            executeTask(pngImage, cubeImages)
        });

    })

    const createModels = (img: HTMLImageElement | undefined, cubeImages: HTMLImageElement[]) => {
        const models = [];
    
        {
            // 创建地面
            const planeVertex = createPlane4()
            const planeData = new Float32Array(planeVertex)
            const planeGeometry = new Geometry({
                position: {
                    data: planeData,
                    size: 3,
                    offset: 0,
                    stride: (3 + 3 + 2) * 4
                },
                normal: {
                    data: planeData,
                    size: 3,
                    offset: (3) * 4,
                    stride: (3 + 3 + 2) * 4
                },
                uv: {
                    data: planeData,
                    size: 2,
                    offset: (3 + 3) * 4,
                    stride: (3 + 3 + 2) * 4
                },
            })
            planeGeometry.vertexCount = planeVertex.length / 8
            const planeMaterial =  new ColorMaterial([1, 0, 0])
            const planeModel = new Model(planeGeometry, planeMaterial)
            models.push(planeModel);
        }

        {
            // 创建立方体模型
            const cubeVertex = createCube3()
            const cubeData = new Float32Array(cubeVertex)
            const cubeGeometry = new Geometry({
                position: {
                    data: cubeData,
                    size: 3,
                    offset: 0,
                    stride: (3 + 3 + 2) * 4
                },
                normal: {
                    data: cubeData,
                    size: 3,
                    offset: (3) * 4,
                    stride: (3 + 3 + 2) * 4
                },
                uv: {
                    data: cubeData,
                    size: 2,
                    offset: (3 + 3) * 4,
                    stride: (3 + 3 + 2) * 4
                },
            })
            cubeGeometry.vertexCount = cubeVertex.length / 8

            const cubeMaterial1 =  new PhongMaterial()
            cubeMaterial1.environmentMap = cubeImages
            const cubeModel1 = new Model(cubeGeometry, cubeMaterial1)
            cubeModel1.modelMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.6, 0, -0.6, 1]
            models.push(cubeModel1);

            
            const cubeMaterial2 =  new ColorMaterial([0, 1, 0], img)
            const cubeModel2 = new Model(cubeGeometry, cubeMaterial2)
            cubeModel2.modelMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.6, 0, 0.6, 1]
            models.push(cubeModel2);

            

            // 创建立方体灯光模型
            const instanceMatrix = []
            const cubInstanceMaterial =  new ColorMaterial([1, 0, 1])
            for(let i = -50; i < 50; i++){
                for(let j = -50; j < 50; j++) {
                    instanceMatrix.push(0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 0.2 * i, 0.1, 0.2 * j, 1)
                }
            }
            const instanceModel = new InstanceModel(cubeGeometry, cubInstanceMaterial, instanceMatrix.length / 16)
            instanceModel.instanceMatrices = new Float32Array(instanceMatrix)
            models.push(instanceModel)


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

        const models = createModels(img, cubeImages)

        const camera = new PerspectiveCamera(Math.PI / 4, canvas.width / canvas.height, 0.1, 100)
        const control = new OrbitControl(canvas, camera)
        const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)

        // 按材质分类
        const materialToModels: Map<string, Model[]> = new Map();
        models.forEach(model => {
            model.onBuild(gl);
            camera.onBuild(gl, model.material._program as WebGLProgram);
            
            if(!materialToModels.get(model.material.type)){
                materialToModels.set(model.material.type, [])
            }
            materialToModels.get(model.material.type)?.push(model)
        })

        // 创建天空盒子
        const skybox = new Skybox(cubeImages as any);
        skybox.onBuild(gl)
        camera.onBuild(gl, skybox.material._program as WebGLProgram);


        const animate = function () {
            control.update()
            render()
            window.requestAnimationFrame(animate)
        }

        function render(){
            gl.enable(gl.DEPTH_TEST)
            gl.depthFunc(gl.LESS)
            gl.clearColor(0.0, 0.0, 0.0, 1)
            gl.clearDepth(1.0)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
            // 绘制模型
            materialToModels.forEach(modelList => {
                const program = modelList[0].material._program as WebGLProgram
                
                gl.useProgram(program)
                camera.setup(gl, program);

                modelList.forEach(mesh => {
                    mesh.render(gl)
                });
                gl.useProgram(program)

            })

            // 绘制天空盒子
            gl.enable(gl.DEPTH_TEST)
            gl.depthFunc(gl.LEQUAL)
            gl.viewport(0.0, 0.0, canvas.width, canvas.height)
            const program = skybox.material._program as WebGLProgram
            gl.useProgram(program)
            camera.setup(gl, program);
            skybox.setup(gl)
            skybox.material.setup(gl)
            skybox.geometry.render(gl)
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

export {InstanceDemo}

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
