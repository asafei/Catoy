/** @format */

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
}

export class Geometry {
    useIndex = false
    vertexCount = 0
    private _indexData?: Float32Array

    set index(indexData: Float32Array | undefined) {
        this._indexData = indexData
        this.useIndex = indexData !== undefined ? true : false
    }

    get index(): Float32Array | undefined {
        return this._indexData
    }

    constructor(public attributes: Attributes) {}
}
