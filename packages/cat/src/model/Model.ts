/** @format */

import {Geometry} from './geometry/Geometry'
import {Material} from './material/Material'

/**
 * TODO:
 * - SceneGraph
 * - 更新机制： needsUpdate
 */
export class Model {
    readonly geometry!: Geometry
    readonly material!: Material
    private _modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])

    get modelMatrix(): Float32Array {
        return this._modelMatrix
    }

    set modelMatrix(matrix: number[] | Float32Array) {
        for (let i = 0, len = this._modelMatrix.length; i < len; i++) {
            this._modelMatrix[i] = matrix[i]
        }
    }

    constructor(geometry: Geometry, material: Material) {
        this.geometry = geometry
        this.material = material
    }
}
