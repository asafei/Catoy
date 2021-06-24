/** @format */

import {Geometry} from './geometry/Geometry'
import {Material} from './materrial/Material'

export class Model {
    readonly geometry!: Geometry
    readonly material!: Material

    constructor(geometry: Geometry, material: Material) {
        this.geometry = geometry
        this.material = geometry
    }
}
