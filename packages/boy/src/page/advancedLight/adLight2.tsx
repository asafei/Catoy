/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube3, createPlane4} from '../data'
import {ColorMaterial, InstanceModel, Geometry, Model} from 'cat'
import {Viewer} from '../../viewer/Viewer'
import {ImageLoader} from '../../utils'

export function AdLight2(): JSX.Element {
    useEffect(() => {
        const pngUrl = './img/container2.png'
        const pngTask = ImageLoader.loadImage(pngUrl)
        const cubeImageTasks = ['right', 'left', 'top', 'bottom', 'back', 'front'].map(face =>
            ImageLoader.loadImage(`./img/cube/cube1/${face}.jpg`),
        )

        Promise.all([pngTask, Promise.all(cubeImageTasks)]).then(([pngImage, cubeImages]) => {
            initViewer(pngImage, cubeImages)
        })
    })

    const initViewer = (png: HTMLImageElement, cubeImages: HTMLImageElement[]) => {
        const viewer = new Viewer(document.getElementById('container') as HTMLDivElement)

        // 添加模型
        {
            // 创建地面
            const planeVertex = createPlane4()
            const planeData = new Float32Array(planeVertex)
            const planeGeometry = new Geometry({
                position: {
                    data: planeData,
                    size: 3,
                    offset: 0,
                    stride: (3 + 3 + 2) * 4,
                },
                normal: {
                    data: planeData,
                    size: 3,
                    offset: 3 * 4,
                    stride: (3 + 3 + 2) * 4,
                },
                uv: {
                    data: planeData,
                    size: 2,
                    offset: (3 + 3) * 4,
                    stride: (3 + 3 + 2) * 4,
                },
            })
            planeGeometry.vertexCount = planeVertex.length / 8
            const planeMaterial = new ColorMaterial([1, 0, 0])
            const planeModel = new Model(planeGeometry, planeMaterial)
            viewer.addModel(planeModel)

            // 创建立方体模型
            const cubeVertex = createCube3()
            const cubeData = new Float32Array(cubeVertex)
            const cubeGeometry = new Geometry({
                position: {
                    data: cubeData,
                    size: 3,
                    offset: 0,
                    stride: (3 + 3 + 2) * 4,
                },
                normal: {
                    data: cubeData,
                    size: 3,
                    offset: 3 * 4,
                    stride: (3 + 3 + 2) * 4,
                },
                uv: {
                    data: cubeData,
                    size: 2,
                    offset: (3 + 3) * 4,
                    stride: (3 + 3 + 2) * 4,
                },
            })
            cubeGeometry.vertexCount = cubeVertex.length / 8

            const cubeMaterial = new ColorMaterial([0, 1, 0], png)
            const cubeModel = new Model(cubeGeometry, cubeMaterial)
            viewer.addModel(cubeModel)

            const instanceMaterial = new ColorMaterial([0, 1, 1])
            const instanceModel = new InstanceModel(cubeGeometry, instanceMaterial, 10000)
            const instanceMatrix = []
            const instanceMatrix2 = []
            const instanceColor = []
            for (let i = -50; i < 50; i++) {
                for (let j = -50; j < 50; j++) {
                    instanceMatrix.push(0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 0.2 * i, -1.2, 0.2 * j, 1)
                    instanceMatrix2.push(0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 0.2 * i, 1.2, 0.2 * j, 1)
                    instanceColor.push(Math.random(), Math.random(), Math.random())
                }
            }
            instanceMatrix.forEach((item, index) => {
                instanceModel.instanceMatrices[index] = item
            })
            instanceModel.instanceColors = new Float32Array(instanceColor)
            viewer.addModel(instanceModel)

            const instanceModel2 = new InstanceModel(cubeGeometry, instanceMaterial, 10000)
            instanceMatrix2.forEach((item, index) => {
                instanceModel2.instanceMatrices[index] = item
            })
            viewer.addModel(instanceModel2)
        }

        // 添加skybox
        viewer.background = cubeImages as any

        viewer.prepare()
        viewer.render()
        ;(window as any).viewer = viewer
    }

    return <div id="container"></div>
}
