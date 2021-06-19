/** @format */

import {Camera} from './Camera'

export class PerspectiveCamera extends Camera {
    static getPerspectiveProjection(fovy: number, aspect: number, near: number, far: number): Float32Array {
        const f = 1.0 / Math.tan(fovy / 2)
        let nf = 0
        const res = new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0])
        if (far != null && far !== Infinity) {
            nf = 1 / (near - far)
            res[10] = (far + near) * nf
            res[14] = 2 * far * near * nf
        } else {
            res[10] = -1
            res[14] = -2 * near
        }
        return res
    }
    getProjection(): number[] {
        throw new Error('Method not implemented.')
    }
}
