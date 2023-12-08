/** @format */

import {WGLUtil} from '../../util'

// TODO: Float32Array等和ArrayBuffer的关系

export interface Attribute {
    data: Float32Array
    /**
     * 一个vertex包含几个数字（eg：一个position[x, y, z]包含3个数字）
     */
    size: number
    /**
     * 每一步偏移几个字节, 才能轮到vertex
     */
    offset: number
    /**
     * 一步包含几个字节（eg: 一个float数字包含4个字节）
     */
    stride: number
}
export interface Attributes {
    position: Attribute
    color?: Attribute
    uv?: Attribute
    normal?: Attribute
}

export class Geometry {
    useIndex = false
    vertexCount = 0
    private _indexData?: Float32Array
    private _vao?: WebGLVertexArrayObject

    set index(indexData: Float32Array | undefined) {
        this._indexData = indexData
        this.useIndex = indexData !== undefined ? true : false
    }

    get index(): Float32Array | undefined {
        return this._indexData
    }

    constructor(public attributes: Attributes) {}

    onBuild(gl: WebGL2RenderingContext, program: WebGLProgram): void {
        if (!this._vao) {
            const attributesWithBuffer = []
            const {position, uv, normal} = this.attributes
            position &&
                attributesWithBuffer.push({
                    name: 'position',
                    attribute: position,
                    buffer: BufferStore.getBuffer(gl, position.data) as WebGLBuffer,
                })
            uv &&
                attributesWithBuffer.push({
                    name: 'uv',
                    attribute: uv,
                    buffer: BufferStore.getBuffer(gl, uv.data) as WebGLBuffer,
                })
            normal &&
                attributesWithBuffer.push({
                    name: 'normal',
                    attribute: normal,
                    buffer: BufferStore.getBuffer(gl, normal.data) as WebGLBuffer,
                })

            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)

            // 将buffer与着色器绑定
            attributesWithBuffer.forEach(({name, attribute, buffer}) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                const main_Vertex = gl.getAttribLocation(program, name)
                gl.vertexAttribPointer(main_Vertex, attribute.size, gl.FLOAT, false, attribute.stride, attribute.offset)
                gl.enableVertexAttribArray(main_Vertex)
                gl.bindBuffer(gl.ARRAY_BUFFER, null)
            })
            gl.bindVertexArray(null)

            this._vao = vao as WebGLVertexArrayObject
        }
    }

    render(gl: WebGL2RenderingContext): void {
        gl.bindVertexArray(this._vao as WebGLVertexArrayObject)
        if (this.index) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index)
            // 注意个数
            gl.drawElements(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0)
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
        }
        gl.bindVertexArray(null)
    }

    renderInstance(gl: WebGL2RenderingContext, instanceCount: number): void {
        gl.bindVertexArray(this._vao as WebGLVertexArrayObject)
        if (this.index) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index)
            // 注意个数
            gl.drawElementsInstanced(gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0, instanceCount)
        } else {
            gl.drawArraysInstanced(gl.TRIANGLES, 0, this.vertexCount, instanceCount)
        }
        gl.bindVertexArray(null)
    }
}

export const BufferStore = {
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
