/** @format */

import {Actor} from '../core'
import {Geometry} from './geometry/Geometry'
import {Material} from './material/Material'

/**
 * TODO:
 * - SceneGraph
 * - 更新机制： needsUpdate
 */
export class Model extends Actor {
    readonly geometry: Geometry
    readonly material: Material
    private _modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    _uniforms: any = {}

    get ModelMatrix(): Float32Array {
        return this._modelMatrix
    }

    get modelMatrix(): Float32Array {
        return this._modelMatrix
    }

    set modelMatrix(matrix: number[] | Float32Array) {
        for (let i = 0, len = this._modelMatrix.length; i < len; i++) {
            this._modelMatrix[i] = matrix[i]
        }
    }

    constructor(geometry: Geometry, material: Material) {
        super()
        this.geometry = geometry
        this.material = material
    }

    onBuild(gl: WebGL2RenderingContext): void {
        this.material.onBuild(gl)
        const program = this.material._program as WebGLProgram
        this.geometry.onBuild(gl, program)

        const modelMatrixLocation = gl.getUniformLocation(program, 'model_uModelMatrix')
        modelMatrixLocation && (this._uniforms._modelMatrix = {location: modelMatrixLocation})

        const modelInstancingLocation = gl.getUniformLocation(program, 'model_uIsInstancing')
        modelInstancingLocation && (this._uniforms._modelInstancing = {location: modelInstancingLocation})
    }

    setup(gl: WebGL2RenderingContext): void {
        const {_modelMatrix, _modelInstancing} = this._uniforms
        _modelInstancing && gl.uniform1f(_modelInstancing.location, 0.0)
        _modelMatrix && gl.uniformMatrix4fv(_modelMatrix.location, false, this._modelMatrix)
    }

    render(gl: WebGL2RenderingContext): void {
        this.setup(gl)
        this.material.setup(gl)
        this.geometry.render(gl)
    }
}
