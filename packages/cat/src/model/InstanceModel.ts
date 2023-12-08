/** @format */

import {Model} from './Model'
import {Geometry, BufferStore} from './geometry/Geometry'
import {Material} from './material/Material'

/**
 * 当我们声明一个数据类型mat4为顶点属性的时候，它比一个vec4更大，是有些不同的
 *  - 顶点属性被允许的最大数据量和vec4相等
 *  - 因为一个mat4大致和4个vec4相等，我们为特定的矩阵必须保留4个顶点属性
 *  - 必须为这4个顶点属性设置属性指针，并将其配置为实例数组
 */
export class InstanceModel extends Model {
    instanceMatrices: Float32Array
    instanceColors?: Float32Array

    constructor(geometry: Geometry, material: Material, instanceCount: number) {
        super(geometry, material)
        this.instanceMatrices = new Float32Array(instanceCount * 16)
    }

    onBuild(gl: WebGL2RenderingContext): void {
        this.material.onBuild(gl)
        const program = this.material._program as WebGLProgram
        {
            const attributesWithBuffer = []
            const {position, uv, normal} = this.geometry.attributes
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
            {
                if (this.instanceColors) {
                    // const colorBuffer = gl.createBuffer()
                    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
                    // gl.bufferData(gl.ARRAY_BUFFER, this.instanceColors, gl.STATIC_DRAW)
                    // const instanceColorLocation = gl.getAttribLocation(program, 'model_instanceColor')
                }
            }

            const matrixBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, this.instanceMatrices, gl.STATIC_DRAW)
            const instanceMatrixLocation = gl.getAttribLocation(program, 'model_instanceMatrix')

            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)

            {
                // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
                // gl.enableVertexAttribArray(instanceColorLocation)
                // gl.vertexAttribPointer(instanceColorLocation, 3, gl.FLOAT, false, 0, 0)
                // gl.vertexAttribDivisor(instanceColorLocation, 1)
                // gl.bindBuffer(gl.ARRAY_BUFFER, null)
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer)
            gl.enableVertexAttribArray(instanceMatrixLocation)
            // mat4类型的数据: 有4个要素，每个要素是一个vec4类型的向量，共16个float
            const bytesPerMatrix = 4 * 16
            for (let i = 0; i < 4; ++i) {
                const loc = instanceMatrixLocation + i
                gl.enableVertexAttribArray(loc)
                const offset = i * 16
                gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, offset)
                gl.vertexAttribDivisor(loc, 1)
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null)

            // 将buffer与着色器绑定
            attributesWithBuffer.forEach(({name, attribute, buffer}) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                const main_Vertex = gl.getAttribLocation(program, name)
                gl.vertexAttribPointer(main_Vertex, attribute.size, gl.FLOAT, false, attribute.stride, attribute.offset)
                gl.enableVertexAttribArray(main_Vertex)
                gl.bindBuffer(gl.ARRAY_BUFFER, null)
            })

            gl.bindVertexArray(null)
            this._uniforms._vao = {vao}
        }
        const modelInstancingLocation = gl.getUniformLocation(program, 'model_uIsInstancing')
        modelInstancingLocation && (this._uniforms._modelInstancing = {location: modelInstancingLocation})

        const modelMatrixLocation = gl.getUniformLocation(program, 'model_uModelMatrix')
        modelMatrixLocation && (this._uniforms._modelMatrix = {location: modelMatrixLocation})
    }

    setup(gl: WebGL2RenderingContext): void {
        const {_modelInstancing, _modelMatrix} = this._uniforms
        _modelMatrix && gl.uniformMatrix4fv(_modelMatrix.location, false, this.modelMatrix)
        // useInstance
        _modelInstancing && gl.uniform1f(_modelInstancing.location, 1.0)
    }

    render(gl: WebGL2RenderingContext): void {
        const {_vao} = this._uniforms
        this.setup(gl)

        this.material.setup(gl)
        gl.bindVertexArray(_vao.vao)

        if (this.geometry.index) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.index)
            // 注意个数
            // gl.drawElementsInstanced(gl.TRIANGLES, this.geometry.index.length, gl.UNSIGNED_SHORT, 0, this.matrices.length / 16)
        } else {
            gl.drawArraysInstanced(gl.TRIANGLES, 0, this.geometry.vertexCount, this.instanceMatrices.length / 16)
        }
        gl.bindVertexArray(null)
    }
}
