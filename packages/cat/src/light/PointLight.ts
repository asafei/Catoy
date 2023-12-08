/** @format */

import {AbstractLight} from './AbstractLight'

export class PointLight extends AbstractLight {
    constant = 1
    linear = 0.09
    quadratic = 0.032

    position: number[]

    constructor(color: number[], position: number[]) {
        super(color)
        this.position = position
    }
}
