/** @format */
import {AbstractLight} from './AbstractLight'

export class DirectionalLight extends AbstractLight {
    direction: number[]

    get Dir() {
        return this.direction
    }

    constructor(color: number[], direction: number[]) {
        super(color)
        this.direction = direction
        this.type = 'directionalLight'
    }
}
