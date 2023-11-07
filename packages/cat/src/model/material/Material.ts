/** @format */
import {WGLUtil} from '../../util'

/**
 * Material 和 着色器绑定的话，如何不同的实现
 * 包括各种gl状态
 */
export class Material {
    depthTest = true
    depthFunc = 513

    _program: WebGLProgram | undefined
    _uniforms: any = {}

    constructor(public type: string, public vsCode: string, public fsCode: string) {}

    onBuild(gl: WebGL2RenderingContext): void {
        this._program = ProgramStore.getProgram(gl, this)
    }
    setup(gl: WebGL2RenderingContext): void {
        throw new Error(`方法setup需要在子类中实现`)
    }

    createTexture(gl: WebGL2RenderingContext, map: HTMLImageElement | HTMLImageElement[]): WebGLTexture | undefined {
        return TextureStore.getTexture(gl, map)
    }

    getUniforms(): string[] {
        throw new Error(`需要在子类中实现`)
    }
}

export type Color = [number, number, number]

const ProgramStore = {
    store: new Map<string, WebGLProgram>(),
    getProgram(gl: WebGLRenderingContext, material: Material) {
        let program = this.store.get(material.type)
        if (!program) {
            program = WGLUtil.createProgramFromSources(gl, material.vsCode, material.fsCode)
            this.store.set(material.type, program as WebGLProgram)
        }
        return program
    },
}

const TextureStore = {
    store: new WeakMap<HTMLImageElement | HTMLImageElement[], WebGLTexture>(),
    getTexture(gl: WebGL2RenderingContext, map: HTMLImageElement | HTMLImageElement[]) {
        let texture = this.store.get(map)
        if (!texture) {
            texture = WGLUtil.createTextureAndBindData(gl, map) as WebGLTexture
            this.store.set(map, texture as WebGLTexture)
        }
        return texture
    },
}

;(window as any)['ProgramStore'] = ProgramStore
;(window as any)['TextureStore'] = TextureStore
