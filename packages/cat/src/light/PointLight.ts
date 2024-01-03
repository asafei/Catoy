/** @format */

import {AbstractLight} from './AbstractLight'

export class PointLight extends AbstractLight {
    constant = 1
    linear = 0.09
    quadratic = 0.032

    position: number[]

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

    constructor(color: number[], position: number[]) {
        super(color)
        this.position = position
        this.type = 'pointLight'
    }
}
