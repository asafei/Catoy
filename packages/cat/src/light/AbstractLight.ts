/** @format */

import {Actor} from '../core'

export abstract class AbstractLight extends Actor {
    constructor(public color: number[] = [1, 1, 1], public intensity: number = 1) {
        super()
    }
}
