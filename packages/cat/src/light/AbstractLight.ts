/** @format */

import {Actor} from '../core'

export abstract class AbstractLight extends Actor {
    public type!: string

    get Color(): number[] {
        return this.color
    }

    get Intensity(): number {
        return this.intensity
    }
    constructor(public color: number[] = [1, 1, 1], public intensity: number = 1) {
        super()
    }
}
