/** @format */

import {Actor, Color, ImageCube} from './core'
import {AbstractLight} from './light'
import {InstanceModel, Model, Skybox, SkyboxMaterial} from './model'
import {Material} from './model/material/Material'

export class Scene extends Actor {
    public skybox?: Skybox

    public instanceModelsByMaterial = new WeakMap<Material, InstanceModel[]>()
    public modelsByMaterial = new WeakMap<Material, Model[]>()
    public lights: AbstractLight[] = []

    get background(): undefined | Color | ImageCube {
        if (this.skybox === undefined) {
            return undefined
        } else if ((this.skybox.material as SkyboxMaterial).maps) {
            return (this.skybox.material as SkyboxMaterial).maps
        } else {
            return (this.skybox.material as SkyboxMaterial).color
        }
    }

    set background(value: undefined | Color | ImageCube) {
        if (value === undefined) {
            this.skybox = undefined
            return
        }

        if (this.skybox === undefined) {
            this.skybox = value.length === 6 ? new Skybox(value) : new Skybox()
        }
        ;(this.skybox.material as SkyboxMaterial).maps = value.length === 6 ? value : undefined
        value.length === 3 ? ((this.skybox.material as SkyboxMaterial).color = value) : null
    }

    add(actor: Model | InstanceModel | AbstractLight): void {
        super.add(actor)
        if (actor instanceof AbstractLight) {
            this.lights.push(actor)
        } else {
            const store = actor instanceof InstanceModel ? this.instanceModelsByMaterial : this.modelsByMaterial
            !store.has(actor.material) && store.set(actor.material, [])
            store.get(actor.material)?.push(actor)
        }
    }
}
