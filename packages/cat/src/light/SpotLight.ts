/** @format */
import {AbstractLight} from './AbstractLight'

export class SpotLight extends AbstractLight {
    constant = 1
    linear = 0.09
    quadratic = 0.032

    position: number[]
    spotDir: number[]

    // 张角一半
    cutOff: number
    // 边缘渐变最大角
    cutOffOuter: number

    get Dir(): number[] {
        return this.spotDir
    }

    get CutOff(): number {
        return this.cutOff
    }

    get CutOffOuter(): number {
        return this.cutOffOuter
    }

    get Position(): number[] {
        return this.position
    }

    get Constant(): number {
        return this.constant
    }

    get Linear(): number {
        return this.linear
    }

    get Quadratic(): number {
        return this.quadratic
    }

    constructor(color: number[], position: number[], spotDir: number[], radian: number) {
        super(color)
        this.position = position
        this.spotDir = spotDir
        this.cutOff = radian / 2
        this.cutOffOuter = this.cutOff + Math.PI / 10
        this.type = 'spotLight'
    }
}
