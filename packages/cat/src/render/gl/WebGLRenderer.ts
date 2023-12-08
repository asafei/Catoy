/** @format */

import {Scene} from '../../Scene'
import {Camera} from '../../camera'
import {Actor} from '../../core'
import {InstanceModel, Model} from '../../model'
import {WGLUtil} from '../../util'
import {UniformSetter} from './utils'
import {WebGLState} from './utils/WebGLState'

export class WebGLRenderer {
    public gl: WebGL2RenderingContext
    public webGLState: WebGLState

    // 最简陋的，直接绘制  =>  区分透明和不透明 + renderOrder
    private renderStore = new Map<string, Actor[]>()
    private actorToVAO = new WeakMap<Actor, WebGLVertexArrayObject>()
    private actorToUniformInfos = new WeakMap<Actor, Map<string, WebGLUniformInfo>>()

    constructor(public canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl2')
        if (!gl) {
            throw new Error('can not get WebGLContext!')
        }
        this.gl = gl
        this.webGLState = new WebGLState(gl)
    }

    render(camera: Camera): void {
        // 渲染: 不透明 => 透明
        const {gl, canvas} = this
        // gl.enable(gl.DEPTH_TEST)
        // gl.depthFunc(gl.LESS)
        {
            // 渲染天空
            // gl.enable(gl.DEPTH_TEST)
            // gl.depthFunc(gl.LEQUAL)
        }

        gl.clearColor(0.0, 0.0, 0.0, 1)
        gl.clearDepth(1.0)
        gl.viewport(0.0, 0.0, canvas.width, canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // console.log('this.renderStore.', this.renderStore.size)

        // TODO: 设置Camera参数
        this.renderStore.forEach((actors, programKey) => {
            const program = ProgramStore.getProgramByKey(programKey)
            if (program) {
                // TODO: 设置status
                gl.useProgram(program)

                // 设置camera相关参数
                const actor0 = actors[0]
                const {depthTest, depthFunc} = (actor0 as Model).material
                if (depthTest === true) {
                    this.webGLState.enable(gl.DEPTH_TEST)
                    this.webGLState.depthFunc(depthFunc)
                } else {
                    this.webGLState.disable(gl.DEPTH_TEST)
                }

                const uniformInfos = this.actorToUniformInfos.get(actor0)
                uniformInfos?.forEach((uniformInfo, uniformName) => {
                    if (uniformName.startsWith('camera')) {
                        const value = (camera as any)[uniformName.split('_u')[1]]
                        value !== undefined &&
                            UniformSetter.setValue(this.gl, uniformInfo.location, value, uniformInfo.type)
                    }
                })

                actors.forEach(actor => {
                    // this.renderActor(actor)
                    if (actor instanceof Model || actor instanceof InstanceModel) {
                        // 设置Model参数 => 设置Material参数 => Geometry.render
                        const uniformInfos = this.actorToUniformInfos.get(actor)
                        const vao = this.actorToVAO.get(actor)
                        uniformInfos?.forEach((uniformInfo, uniformName) => {
                            let value
                            if (uniformName.startsWith('model')) {
                                value = (actor as any)[uniformName.split('_u')[1]]
                            } else if (uniformName.startsWith('material')) {
                                value = (actor.material as any)[uniformName.split('_u')[1]]
                            }
                            if (!(value !== undefined && vao)) {
                                return
                            }

                            UniformSetter.setValue(
                                this.gl,
                                uniformInfo.location,
                                value,
                                uniformInfo.type,
                                uniformInfo.texture,
                            )
                        })

                        if (!vao) {
                            return
                        }

                        gl.bindVertexArray(vao)

                        if (actor instanceof InstanceModel) {
                            if (actor.geometry.index) {
                                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, actor.geometry.index)
                                gl.drawElements(gl.TRIANGLES, actor.geometry.index.length, gl.UNSIGNED_SHORT, 0)
                            } else {
                                gl.drawArraysInstanced(
                                    gl.TRIANGLES,
                                    0,
                                    actor.geometry.vertexCount,
                                    actor.instanceMatrices.length / 16,
                                )
                            }
                        } else if (actor instanceof Model) {
                            if (actor.geometry.index) {
                                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, actor.geometry.index)
                                gl.drawElements(gl.TRIANGLES, actor.geometry.index.length, gl.UNSIGNED_SHORT, 0)
                            } else {
                                gl.drawArrays(gl.TRIANGLES, 0, actor.geometry.vertexCount)
                            }
                        }

                        gl.bindVertexArray(null)
                    }
                })
            }
        })
    }

    public prepare(scene: Scene): void {
        this.prepareSkybox(scene.skybox)

        scene.traverse((actor: Actor) => {
            // 当前仅考虑Model和InstanceModel，暂不考虑灯光相关
            const programInfo = ProgramStore.getProgramInfoByActor(this.gl, actor)
            if (programInfo) {
                !this.renderStore.has(programInfo.programKey) && this.renderStore.set(programInfo.programKey, [])
                this.renderStore.get(programInfo.programKey)?.push(actor)

                // actor => program => uniforms，获取uniform的配置：name，size，type，location
                const uniformInfos = WebGLUniformExecutor.getUniformMapInfo(this.gl, programInfo.program, actor)
                uniformInfos && this.actorToUniformInfos.set(actor, uniformInfos)

                // TODO 初始化geometryBuffer => vao好了
                const vao = WebGLBufferExecutor.getVAO(this.gl, programInfo.program, actor)
                vao && this.actorToVAO.set(actor, vao)
            }
        })
    }

    private prepareSkybox(skybox: any) {
        if (!skybox) return
        const programInfo = ProgramStore.getProgramInfoByActor(this.gl, skybox)
        if (programInfo) {
            !this.renderStore.has(programInfo.programKey) && this.renderStore.set(programInfo.programKey, [])
            this.renderStore.get(programInfo.programKey)?.push(skybox)

            // actor => program => uniforms，获取uniform的配置：name，size，type，location
            const uniformInfos = WebGLUniformExecutor.getUniformMapInfo(this.gl, programInfo.program, skybox)
            uniformInfos && this.actorToUniformInfos.set(skybox, uniformInfos)

            // TODO 初始化geometryBuffer => vao好了
            const vao = WebGLBufferExecutor.getVAO(this.gl, programInfo.program, skybox)
            vao && this.actorToVAO.set(skybox, vao)
        }
    }
}

interface WebGLUniformInfo extends WebGLActiveInfo {
    location: WebGLUniformLocation
    texture?: WebGLTexture
}

const WebGLUniformExecutor = {
    programToUniformInfo: new WeakMap<WebGLProgram, Map<string, WebGLUniformInfo>>(),

    getUniformMapInfo(gl: WebGL2RenderingContext, program: WebGLProgram, actor: Actor) {
        const uniformInfos = this._getProgramUniformInfo(gl, program)
        if (uniformInfos) {
            uniformInfos.forEach((uniformInfo, key) => {
                console.log(key, uniformInfo)
                if (
                    (uniformInfo.type === gl.SAMPLER_2D || uniformInfo.type === gl.SAMPLER_CUBE) &&
                    (actor as any).material[uniformInfo.name.split('_u')[1]]
                ) {
                    const texture = TextureStore.getTexture(
                        gl,
                        (actor as any).material[uniformInfo.name.split('_u')[1]],
                    )
                    uniformInfo.texture = texture
                }
            })
        }
        return uniformInfos
    },

    _getProgramUniformInfo(gl: WebGL2RenderingContext, program: WebGLProgram) {
        if (!this.programToUniformInfo.has(program)) {
            const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
            const uniformInfos = new Map<string, WebGLUniformInfo>()
            for (let i = 0; i < n; i++) {
                const uniformInfo = gl.getActiveUniform(program, i) as WebGLActiveInfo
                const uniformLoc = gl.getUniformLocation(program, uniformInfo.name) as WebGLUniformLocation

                uniformInfos.set(uniformInfo.name, {
                    name: uniformInfo.name,
                    size: uniformInfo.size,
                    type: uniformInfo.type,
                    location: uniformLoc,
                    texture: undefined,
                })
            }

            this.programToUniformInfo.set(program, uniformInfos)
        }
        return this.programToUniformInfo.get(program)
    },
}

const TextureStore = {
    store: new WeakMap<HTMLImageElement | HTMLImageElement[], WebGLTexture>(),
    getTexture(gl: WebGL2RenderingContext, map: HTMLImageElement | HTMLImageElement[]) {
        let texture = this.store.get(map)
        if (!texture) {
            texture = WGLUtil.createTextureAndBindData(gl, map) as WebGLTexture
            this.store.set(map, texture as WebGLTexture)
        }
        return texture
    },
}
;(window as any)['TextureStore'] = TextureStore
/************************************************************* */
type WebGLAttributeInfo = {
    type: number
    location: number
    locationSize: number
}
const WebGLBufferExecutor = {
    actorToVAO: new WeakMap<Actor, WebGLVertexArrayObject>(),
    programToAttributeInfo: new WeakMap<WebGLProgram, Map<string, WebGLAttributeInfo>>(),

    getVAO(gl: WebGL2RenderingContext, program: WebGLProgram, actor: Actor) {
        if (!this.actorToVAO.has(actor)) {
            const locationInfos = this._getProgramAttributeLoc(gl, program)

            const attributesWithBuffer = []
            if (actor instanceof Model) {
                const {position, uv, normal} = actor.geometry.attributes
                position &&
                    attributesWithBuffer.push({
                        name: 'position',
                        attribute: position,
                        locationInfo: locationInfos.get('position'),
                        buffer: BufferStore.getBuffer(gl, position.data) as WebGLBuffer,
                    })
                uv &&
                    attributesWithBuffer.push({
                        name: 'uv',
                        attribute: uv,
                        locationInfo: locationInfos.get('uv'),
                        buffer: BufferStore.getBuffer(gl, uv.data) as WebGLBuffer,
                    })
                normal &&
                    attributesWithBuffer.push({
                        name: 'normal',
                        attribute: normal,
                        locationInfo: locationInfos.get('normal'),
                        buffer: BufferStore.getBuffer(gl, normal.data) as WebGLBuffer,
                    })
            }

            if (actor instanceof InstanceModel) {
                attributesWithBuffer.push({
                    name: 'model_instanceMatrix',
                    attribute: {
                        data: actor.instanceMatrices,
                        size: 16,
                        offset: 0,
                        stride: 64,
                    },
                    locationInfo: locationInfos.get('model_instanceMatrix'),
                    buffer: BufferStore.getBuffer(gl, actor.instanceMatrices) as WebGLBuffer,
                })

                actor.instanceColors &&
                    attributesWithBuffer.push({
                        name: 'model_instanceColor',
                        attribute: {
                            data: actor.instanceColors,
                            size: 3,
                            offset: 0,
                            stride: 12,
                        },
                        locationInfo: locationInfos.get('model_instanceColor'),
                        buffer: BufferStore.getBuffer(gl, actor.instanceColors) as WebGLBuffer,
                    })
            }

            const vao = gl.createVertexArray() as WebGLVertexArrayObject
            gl.bindVertexArray(vao)

            attributesWithBuffer.forEach(({name, attribute, locationInfo, buffer}) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                // 放在这里重复过多
                // const aLoc = gl.getAttribLocation(program, name)
                const aLoc = (locationInfo as WebGLAttributeInfo).location
                // 目前只有mat4类型的数据， TODO: 扩展
                if (name === 'model_instanceMatrix') {
                    // mat4类型的数据: 有4个要素，每个要素是一个vec4类型的向量，共16个float
                    const bytesPerMatrix = 4 * 16
                    for (let i = 0; i < 4; ++i) {
                        const loc = aLoc + i
                        gl.enableVertexAttribArray(loc)
                        const offset = i * 16
                        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, offset)
                        gl.vertexAttribDivisor(loc, 1)
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, null)
                } else if (name === 'model_instanceColor') {
                    gl.vertexAttribPointer(aLoc, attribute.size, gl.FLOAT, false, attribute.stride, attribute.offset)
                    gl.enableVertexAttribArray(aLoc)
                    gl.vertexAttribDivisor(aLoc, 1)
                    gl.bindBuffer(gl.ARRAY_BUFFER, null)
                } else {
                    gl.vertexAttribPointer(aLoc, attribute.size, gl.FLOAT, false, attribute.stride, attribute.offset)
                    gl.enableVertexAttribArray(aLoc)
                    gl.bindBuffer(gl.ARRAY_BUFFER, null)
                }
            })

            gl.bindVertexArray(null)

            this.actorToVAO.set(actor, vao)
        }
        return this.actorToVAO.get(actor)
    },

    _getProgramAttributeLoc(gl: WebGL2RenderingContext, program: WebGLProgram) {
        if (!this.programToAttributeInfo.has(program)) {
            const attributes = new Map<string, WebGLAttributeInfo>()
            const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)

            console.log('attributeCount', attributeCount)
            for (let i = 0; i < attributeCount; i++) {
                const info = gl.getActiveAttrib(program, i) as WebGLActiveInfo
                console.log('info', info)
                const name = info.name

                let locationSize = 1
                if (info.type === gl.FLOAT_MAT2) locationSize = 2
                if (info.type === gl.FLOAT_MAT3) locationSize = 3
                if (info.type === gl.FLOAT_MAT4) locationSize = 4

                attributes.set(name, {
                    type: info.type,
                    location: gl.getAttribLocation(program, name),
                    locationSize: locationSize,
                })
            }
            this.programToAttributeInfo.set(program, attributes)
        }
        return this.programToAttributeInfo.get(program) as Map<string, WebGLAttributeInfo>
    },
}

const BufferStore = {
    store: new WeakMap<Float32Array, WebGLBuffer>(),
    getBuffer(gl: WebGL2RenderingContext, data: Float32Array): WebGLBuffer {
        let buffer = this.store.get(data)
        if (!buffer) {
            buffer = WGLUtil.createBufferAndBindData(gl, gl.ARRAY_BUFFER, data, gl.STATIC_DRAW) as WebGLBuffer
            this.store.set(data, buffer as WebGLBuffer)
        }
        return buffer
    },
}
;(window as any)['BufferStore'] = BufferStore
/**------------------------------------------------------------ */
type WebGLProgramInfo = {
    programKey: string
    program: WebGLProgram
}
const ProgramStore = {
    store: new Map<string, WebGLProgramInfo>(),

    getProgramInfoByActor(gl: WebGLRenderingContext, actor: Actor): WebGLProgramInfo | undefined {
        const programKey = this.getProgramKeyByActor(actor)

        if (!this.hasProgrom(programKey)) {
            const prefixVertex = ['#version 300 es']
            const prefixFragment = ['#version 300 es', 'precision mediump float;']

            if (actor instanceof InstanceModel) {
                actor.instanceMatrices && prefixVertex.push('#define USE_INSTANCING')
                actor.instanceColors && prefixVertex.push('#define USE_INSTANCECOLOR')

                actor.instanceColors && prefixFragment.push('#define USE_INSTANCECOLOR')
            }

            if (actor instanceof Model) {
                const vsCode = prefixVertex.join('\n') + '\n' + actor.material.VSCode
                const fsCode = prefixFragment.join('\n') + '\n' + actor.material.FSCode

                const program = this.createProgram(gl, vsCode, fsCode)
                program && this.store.set(programKey, {programKey, program})
            }
        }

        return this.store.get(programKey)
    },

    getProgramKeyByActor(actor: Actor): string {
        let programKey = ''
        if (actor instanceof InstanceModel) {
            programKey += actor.instanceMatrices ? 'USE_INSTANCING' : ''
            programKey += actor.instanceColors ? 'USE_INSTANCING_COLOR' : ''
            programKey += actor.material.type
        } else if (actor instanceof Model) {
            programKey += actor.material.type
        }

        return programKey
    },

    getProgramByKey(programKey: string): WebGLProgram | undefined {
        return this.store.get(programKey)?.program
    },

    hasProgrom(programKey: string): boolean {
        return this.store.has(programKey)
    },

    createProgram(gl: WebGLRenderingContext, vsCode: string, fsCode: string): WebGLProgram | undefined {
        const program = WGLUtil.createProgramFromSources(gl, vsCode, fsCode)
        if (!program) {
            console.warn('create program failed!')
        }
        return program
    },
}
;(window as any)['ProgramStore'] = ProgramStore
