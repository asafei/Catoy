/** @format */

import React, {useEffect} from 'react'
import '../../css/index.css'
import {createCube2, createPlane2} from '../data'
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
 *
 * 使用光照贴图：光照贴图是给材质的
 *     * ambient：diffuseMap 采样后乘以一个小系数，作为环境光因子
 *     * diffuse： diffuseMap 采样，得到漫反射因子
 *     * specular： specularMap 采样，得到镜面反射因子
 *
 *  => 光源类型（多光源）
 *    * 定向光：没有位置，有固定的方向，就无需在着色器中计算光的方向了
 *    * 点光源：效果不仅与光照方向有关，还与与光位置的距离有关（距离增大，强度衰减）
 *          - position
 *          - ambient、diffuse、specular
 *          - constant: 常数
 *          - linear：一次项
 *          - quadratic：二次项
 *
 *    * 聚光灯
 *
 */
function Light8(): JSX.Element {
    useEffect(() => {
        const diffuseUrl = './img/container2.png'
        const specularUrl = './img/container2_specular.png'
        Promise.all([loadImage(diffuseUrl), loadImage(specularUrl)]).then(([diffuseMap, specularMap]) => {
            executeTask(diffuseMap, specularMap)
        })
    })

    const executeTask = (diffuseMap: HTMLImageElement, specularMap: HTMLImageElement) => {
        const element = document.getElementById('container')
        const canvas = document.createElement('canvas')
        element?.appendChild(canvas)
        canvas.className = 'canvas'
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const gl = canvas.getContext('webgl2')!

        const dLight = {
            direction: [0, -1, -1],
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.1, 0.1, 0.8],
            specular: [1, 1, 1],
        }
        const pLight = {
            color: [1, 1, 1],
            position: [1, 1, 1],
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.5, 0.5, 0.5],
            specular: [1, 1, 1],
            constant: 1,
            linear: 0.09,
            quadratic: 0.032,
        }

        const sLight = {
            position: [0, 0, 2],
            spotDir: [0, 0, -1],
            cutOff: Math.PI / 8, // 即张角的一半
            cutOffOuter: Math.PI / 6,
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.8, 0.2, 0.2],
            specular: [1, 1, 1],
            constant: 1,
            linear: 0.09,
            quadratic: 0.032,
        }

        const light = {
            color: [1, 1, 1],
            position: [1, 1, 1],
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.5, 0.5, 0.5],
            specular: [1, 1, 1],
        }

        // 这是材质中的属性
        const texture0 = gl.createTexture()
        // 默认激活0，可不写， 需要在纹理绑定之前激活
        gl.activeTexture(gl.TEXTURE0 + 0)
        gl.bindTexture(gl.TEXTURE_2D, texture0)
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, diffuseMap)
        gl.generateMipmap(gl.TEXTURE_2D)
        // gl.uniform1i(unit, 0);
        gl.bindTexture(gl.TEXTURE_2D, null)

        const texture1 = gl.createTexture()
        // 默认激活0，可不写， 需要在纹理绑定之前激活
        gl.activeTexture(gl.TEXTURE0 + 1)
        gl.bindTexture(gl.TEXTURE_2D, texture1)
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, specularMap)
        gl.generateMipmap(gl.TEXTURE_2D)
        // gl.uniform1i(unit, 0);
        gl.bindTexture(gl.TEXTURE_2D, null)

        const models: any[] = [
            {
                name: 'cube',
                execute: createCube2,
                color: [1, 0, 0],
                material: materialPhongs[0],
                isLight: false,
                pointCount: 36,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
            {
                name: 'cubeLight',
                execute: createCube2,
                color: light.color,
                isLight: true,
                pointCount: 36,
                objectModelMatrix: new Float32Array([0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 1, 1, 1, 1]),
            },
            {
                name: 'plane',
                execute: createPlane2,
                color: [1, 1, 0],
                material: materialPhongs[1],
                isLight: false,
                pointCount: 6,
                objectModelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            },
        ].map(({name, color, isLight, material, pointCount, execute, objectModelMatrix}) => {
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
                material,
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
            in vec3 normal;
            in vec2 uv;

            uniform mat4 camera_uProjectionMatrix;
            uniform mat4 camera_uViewMatrix;
            uniform mat4 model_uModelMatrix;

            out vec3 vNormal;
            out vec3 vFragPos;
            out vec2 vUV;

            void main(void) { 
                // vNormal = normal;
                vNormal = mat3(transpose(inverse(model_uModelMatrix))) * normal;
                vec4 positionWorldSpace = model_uModelMatrix * vec4(position, 1.);
                gl_Position = camera_uProjectionMatrix * camera_uViewMatrix * positionWorldSpace;
                vFragPos = positionWorldSpace.xyz;
                vUV = uv;
            }`
        const mainFragCode = `#version 300 es
            precision mediump float;

            in vec3 vNormal;
            in vec3 vFragPos;
            in vec2 vUV;

            uniform vec3 u_Color;
            uniform float u_IsLight;
            uniform vec3 u_viewPosition;

            // uniform vec3 u_lightPosition;
            // uniform vec3 u_lightColor;
            // uniform vec3 u_lightAmbient;
            // uniform vec3 u_lightDiffuse;
            // uniform vec3 u_lightSpecular;

            uniform vec3 u_directionalLightDir;
            uniform vec3 u_directionalLightAmbient;
            uniform vec3 u_directionalLightDiffuse;
            uniform vec3 u_directionalLightSpecular;
            vec3 calculateDirectionalLightColor(
                vec3 normalDir,
                vec3 viewDir,
                float shininess,
                vec3 materialDiffuseColor, 
                vec3 materialSpecularColor
            ) {
                vec3 ambient = u_directionalLightAmbient * materialDiffuseColor;

                vec3 lightDir =  normalize(-u_directionalLightDir);
                float diff = max(dot(normalDir, lightDir), 0.0);
                vec3 diffuse = u_directionalLightDiffuse * diff * materialDiffuseColor;

                vec3 reflectDir = reflect(-lightDir, normalDir);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = u_directionalLightSpecular * spec * materialSpecularColor;

                vec3 color = ambient + diffuse + specular;
                return color;
            } 

            uniform vec3 u_pointLightPosition;
            uniform vec3 u_pointLightAmbient;
            uniform vec3 u_pointLightDiffuse;
            uniform vec3 u_pointLightSpecular;
            uniform float u_pointLightConstant;
            uniform float u_pointLightLinear;
            uniform float u_pointLightQuadratic;
            vec3 calculatePointLightColor(
                vec3 normalDir,
                vec3 fragPos,
                vec3 viewDir,
                float shininess,
                vec3 materialDiffuseColor, 
                vec3 materialSpecularColor
            ) {
                float fragDistanceToLight = length(fragPos - u_pointLightPosition);
                float attenuation = 1.0 / (u_pointLightConstant + u_pointLightLinear * fragDistanceToLight + u_pointLightQuadratic * (fragDistanceToLight * fragDistanceToLight));

                vec3 ambient = attenuation * u_pointLightAmbient * materialDiffuseColor;

                vec3 lightDir =  normalize(u_pointLightPosition - fragPos);
                float diff = max(dot(normalDir, lightDir), 0.0);
                vec3 diffuse = attenuation * u_pointLightDiffuse * diff * materialDiffuseColor;

                vec3 reflectDir = reflect(-lightDir, normalDir);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = attenuation * u_pointLightSpecular * spec * materialSpecularColor;

                vec3 color = ambient + diffuse + specular;
                return color;
            }

            uniform vec3 u_spotLightPosition;
            uniform vec3 u_spotLightAmbient;
            uniform vec3 u_spotLightDiffuse;
            uniform vec3 u_spotLightSpecular;
            uniform vec3 u_spotLightDir;
            uniform float u_spotLightCutOff;
            uniform float u_spotLightCutOffOuter;
            uniform float u_spotLightConstant;
            uniform float u_spotLightLinear;
            uniform float u_spotLightQuadratic;
            
            // https://learnopengl-cn.readthedocs.io/zh/latest/02%20Lighting/05%20Light%20casters/
            vec3 calculateSpotLightColor(
                vec3 normalDir,
                vec3 fragPos,
                vec3 viewDir,
                float shininess,
                vec3 materialDiffuseColor, 
                vec3 materialSpecularColor
            ) {
                // 计算衰减
                float fragDistanceToLight = length(fragPos - u_spotLightPosition);
                float attenuation = (u_spotLightConstant + u_spotLightLinear * fragDistanceToLight + u_spotLightQuadratic * (fragDistanceToLight * fragDistanceToLight));

                // 指向光源
                vec3 lightDir = normalize(u_spotLightPosition - fragPos);
                float theta = dot(u_spotLightDir, - lightDir);
                float epsilon = u_spotLightCutOff - u_spotLightCutOffOuter;
                float intensity = clamp((theta - u_spotLightCutOffOuter) / epsilon, 0.0, 1.0);

                // 着色
                vec3 ambient = u_spotLightAmbient * materialDiffuseColor;

                float diff = max(dot(normalDir, lightDir), 0.0);
                vec3 diffuse = u_spotLightDiffuse * diff * materialDiffuseColor;

                vec3 reflectDir = reflect(-lightDir, normalDir);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = u_spotLightSpecular * spec * materialSpecularColor;

                return (ambient + diffuse + specular) * intensity * attenuation;
            } 
            

            // uniform vec3 u_materialAmbient;
            // uniform vec3 u_materialDiffuse;
            // uniform vec3 u_materialSpecular;
            uniform float u_materialShininess;

            uniform sampler2D u_texture0;
            uniform sampler2D u_texture1;

            out vec4 outColor;

            void main(void) {
                if(u_IsLight > 0.0){
                    outColor = vec4(u_Color, 1.0);
                } else{
                    vec3 norm = normalize(vNormal);
                    vec3 viewDir = normalize(u_viewPosition - vFragPos);

                    vec3 materialDiffuseColor = texture(u_texture0, vUV).rgb;
                    vec3 materialSpecularColor = texture(u_texture1, vUV).rgb;
                    
                    vec3 directionalColor =  calculateDirectionalLightColor(norm, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
                    vec3 pointColor =  calculatePointLightColor(norm, vFragPos, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
                    vec3 spotColor =  calculateSpotLightColor(norm, vFragPos, viewDir, u_materialShininess, materialDiffuseColor, materialSpecularColor);
                    
                    vec3 color = directionalColor + pointColor + spotColor;
                    outColor = vec4(color, 1.0);
                }
            }`

        const mainProgram = WGLUtil.createProgramFromSources(gl, mainVertCode, mainFragCode)!
        const main_objectModelMatrixLocation = gl.getUniformLocation(mainProgram, 'model_uModelMatrix')
        const main_cameraProjectionLocation = gl.getUniformLocation(mainProgram, 'camera_uProjectionMatrix')
        const main_cameraViewMatrixLocation = gl.getUniformLocation(mainProgram, 'camera_uViewMatrix')
        const main_modelColor = gl.getUniformLocation(mainProgram, 'u_Color')

        const main_samplerDiffuse = gl.getUniformLocation(mainProgram, 'u_texture0')
        const main_samplerSpecular = gl.getUniformLocation(mainProgram, 'u_texture1')

        const main_uIsLight = gl.getUniformLocation(mainProgram, 'u_IsLight')
        const main_uDirectionalLightDir = gl.getUniformLocation(mainProgram, 'u_directionalLightDir')
        const main_uDirectionalLightAmbient = gl.getUniformLocation(mainProgram, 'u_directionalLightAmbient')
        const main_uDirectionalLightDiffuse = gl.getUniformLocation(mainProgram, 'u_directionalLightDiffuse')
        const main_uDirectionalLightSpecular = gl.getUniformLocation(mainProgram, 'u_directionalLightSpecular')

        const main_uPointLightPosition = gl.getUniformLocation(mainProgram, 'u_pointLightPosition')
        const main_uPointLightAmbient = gl.getUniformLocation(mainProgram, 'u_pointLightAmbient')
        const main_uPointLightDiffuse = gl.getUniformLocation(mainProgram, 'u_pointLightDiffuse')
        const main_uPointLightSpecular = gl.getUniformLocation(mainProgram, 'u_pointLightSpecular')
        const main_uPointLightConstant = gl.getUniformLocation(mainProgram, 'u_pointLightConstant')
        const main_uPointLightLinear = gl.getUniformLocation(mainProgram, 'u_pointLightLinear')
        const main_uPointLightQuadratic = gl.getUniformLocation(mainProgram, 'u_pointLightQuadratic')

        const main_uSpotLightPosition = gl.getUniformLocation(mainProgram, 'u_spotLightPosition')
        const main_uSpotLightAmbient = gl.getUniformLocation(mainProgram, 'u_spotLightAmbient')
        const main_uSpotLightDiffuse = gl.getUniformLocation(mainProgram, 'u_spotLightDiffuse')
        const main_uSpotLightSpecular = gl.getUniformLocation(mainProgram, 'u_spotLightSpecular')
        const main_uSpotLightDir = gl.getUniformLocation(mainProgram, 'u_spotLightDir')
        const main_uSpotLightCutOff = gl.getUniformLocation(mainProgram, 'u_spotLightCutOff')
        const main_uSpotLightCutOffOuter = gl.getUniformLocation(mainProgram, 'u_spotLightCutOffOuter')
        const main_uSpotLightConstant = gl.getUniformLocation(mainProgram, 'u_spotLightConstant')
        const main_uSpotLightLinear = gl.getUniformLocation(mainProgram, 'u_spotLightLinear')
        const main_uSpotLightQuadratic = gl.getUniformLocation(mainProgram, 'u_spotLightQuadratic')

        const main_uMaterialShininess = gl.getUniformLocation(mainProgram, 'u_materialShininess')
        const main_uViewPosition = gl.getUniformLocation(mainProgram, 'u_viewPosition')

        models.forEach(modelInfo => {
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)

            // 将buffer与着色器绑定
            gl.bindBuffer(gl.ARRAY_BUFFER, modelInfo.attributes.buffer)
            const main_Position = gl.getAttribLocation(mainProgram, 'position')
            gl.vertexAttribPointer(main_Position, 3, gl.FLOAT, false, 32, 0)
            gl.enableVertexAttribArray(main_Position)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)

            gl.bindBuffer(gl.ARRAY_BUFFER, modelInfo.attributes.buffer)
            const main_Normal = gl.getAttribLocation(mainProgram, 'normal')
            gl.vertexAttribPointer(main_Normal, 3, gl.FLOAT, false, 32, 12)
            gl.enableVertexAttribArray(main_Normal)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)

            gl.bindBuffer(gl.ARRAY_BUFFER, modelInfo.attributes.buffer)
            const main_UV = gl.getAttribLocation(mainProgram, 'uv')
            gl.vertexAttribPointer(main_UV, 2, gl.FLOAT, false, 32, 24)
            gl.enableVertexAttribArray(main_UV)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)

            gl.activeTexture(gl.TEXTURE0 + 0)
            gl.bindTexture(gl.TEXTURE_2D, texture0)
            gl.activeTexture(gl.TEXTURE0 + 1)
            gl.bindTexture(gl.TEXTURE_2D, texture1)

            gl.bindVertexArray(null)
            modelInfo.vao = vao
        })

        const camera = new PerspectiveCamera(Math.PI / 4, canvas.width / canvas.height, 1, 100)
        const control = new OrbitControl(canvas, camera)
        const cameraModelMatrix = new Float32Array([0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 1])
        invert(camera.cameraViewMatrix, cameraModelMatrix)

        let i = 0
        const animate = function (time: number) {
            control.update()
            {
                // 让点光源动起来
                pLight.position[0] = Math.cos(i)
                pLight.position[1] = Math.sin(i)
                models[1].objectModelMatrix[12] = Math.cos(i)
                models[1].objectModelMatrix[13] = Math.sin(i)
                i += 0.01
            }

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
                gl.uniform3f(main_uDirectionalLightDir, dLight.direction[0], dLight.direction[1], dLight.direction[2])
                gl.uniform3f(main_uDirectionalLightAmbient, dLight.ambient[0], dLight.ambient[1], dLight.ambient[2])
                gl.uniform3f(main_uDirectionalLightDiffuse, dLight.diffuse[0], dLight.diffuse[1], dLight.diffuse[2])
                gl.uniform3f(main_uDirectionalLightSpecular, dLight.specular[0], dLight.specular[1], dLight.specular[2])

                gl.uniform3f(main_uPointLightPosition, pLight.position[0], pLight.position[1], pLight.position[2])
                gl.uniform3f(main_uPointLightAmbient, pLight.ambient[0], pLight.ambient[1], pLight.ambient[2])
                gl.uniform3f(main_uPointLightDiffuse, pLight.diffuse[0], pLight.diffuse[1], pLight.diffuse[2])
                gl.uniform3f(main_uPointLightSpecular, pLight.specular[0], pLight.specular[1], pLight.specular[2])
                gl.uniform1f(main_uPointLightConstant, pLight.constant)
                gl.uniform1f(main_uPointLightLinear, pLight.linear)
                gl.uniform1f(main_uPointLightQuadratic, pLight.quadratic)

                gl.uniform3f(main_uSpotLightPosition, sLight.position[0], sLight.position[1], sLight.position[2])
                gl.uniform3f(main_uSpotLightAmbient, sLight.ambient[0], sLight.ambient[1], sLight.ambient[2])
                gl.uniform3f(main_uSpotLightDiffuse, sLight.diffuse[0], sLight.diffuse[1], sLight.diffuse[2])
                gl.uniform3f(main_uSpotLightSpecular, sLight.specular[0], sLight.specular[1], sLight.specular[2])
                gl.uniform3f(main_uSpotLightDir, sLight.spotDir[0], sLight.spotDir[1], sLight.spotDir[2])
                gl.uniform1f(main_uSpotLightCutOff, Math.cos(sLight.cutOff))
                gl.uniform1f(main_uSpotLightCutOffOuter, Math.cos(sLight.cutOffOuter))
                gl.uniform1f(main_uSpotLightConstant, sLight.constant)
                gl.uniform1f(main_uSpotLightLinear, sLight.linear)
                gl.uniform1f(main_uSpotLightQuadratic, sLight.quadratic)

                // 全局uniform --- 材质
                gl.uniform1f(main_uMaterialShininess, materialPhongs[materialIndex].shininess * 128)
                gl.uniform1i(main_samplerDiffuse, 0) // 纹理单元 0
                gl.uniform1i(main_samplerSpecular, 1) // 纹理单元 1

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

export {Light8}

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
