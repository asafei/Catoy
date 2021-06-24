/** @format */

// TODO: Float32Array等和ArrayBuffer的关系
export interface Attributes {
    vertex: Float32Array
    color?: Float32Array
    uv?: Float32Array
}

// ArrayBuffer

export class Geometry {
    static fromBuffer(attributes: Attributes, index: Float32Array): Geometry {
        return new Geometry()
    }
}
