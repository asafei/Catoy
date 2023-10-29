/** @format */

export class Material {
    constructor(public type: string, public vsCode: string, public fsCode: string) {}
    getUniforms(): string[] {
        throw new Error(`需要在子类中实现`)
    }
}

// export interface Material {
//     type: string
//     vsCode: string
//     fsCode: string
//     getUnifroms(): string[]
// }
