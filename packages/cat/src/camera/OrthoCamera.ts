/** @format */

import {Camera} from './Camera'

export class OrthoCamera extends Camera {
    static getOrthoProjection(
        left: number,
        right: number,
        bottom: number,
        top: number,
        near: number,
        far: number,
    ): Float32Array {
        const lr = 1 / (left - right)
        const bt = 1 / (bottom - top)
        const nf = 1 / (near - far)
        const res = new Float32Array([
            -2 * lr,
            0,
            0,
            0,
            0,
            -2 * bt,
            0,
            0,
            0,
            0,
            2 * nf,
            0,
            (left + right) * lr,
            (top + bottom) * bt,
            (far + near) * nf,
            1,
        ])
        return res
    }
}
