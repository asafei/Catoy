/** @format */
import {AbstractLight} from './AbstractLight'

export class DirectionalLights extends AbstractLight {
    direction: number[]
    constructor(color: number[], direction: number[]) {
        super(color)
        this.direction = direction
    }
}
