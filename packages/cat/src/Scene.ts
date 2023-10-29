/** @format */

import {Model} from './model'
import {Material} from './model/material/Material'
import {Program} from './render'

export class Scene {
    private programs = new Map<string, Program>()
    private models = new WeakMap<Program, Model[]>()

    // 接受数据，且根据判断是否需要实例化新的program
    add(model: Model): void {
        // 根据material去实例化program
        const {geometry, material} = model
        if (!this.programs.has(material.type)) {
            const program = this.buildProgram(material)
            this.models.set(program, [])
        }
        this.models.get(this.programs.get(material.type)!)?.push(model)
    }

    // remove(): void {

    // }

    // dispose(): void {

    // }

    private buildProgram(material: Material): Program {
        return Program
    }
}
