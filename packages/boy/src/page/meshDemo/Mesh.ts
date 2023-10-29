/** @format */

export class Mesh {
    constructor(geometrie: Geometry, material: Material) {
        console.log('Mesh')
    }

    setUp(): void {
        console.log('setUp')
        /**
         * 需要在这里初始化buffer吗
         * - 该mesh 有没有被添加到场景中
         * - 场景的绘制，使用的webgl，还是webgpu，or css等
         * - 如何确定不会重复创建相同的buffer（在renderer中控制？）
         *    - buffer存储在全局
         *
         * eg: 确定是webgl，可以直接创建并绑定vao [vbo, vbo, vbo]
         */
    }

    draw(shader: any): void {
        console.log('draw')
    }
}

export class Geometry {
    constructor(
        private positions?: number[],
        private normals?: number[],
        private uvs?: number[],
        private indices?: number[],
    ) {
        console.log('Geometry')
    }
}

export class Material {
    needsUpdate = false
    constructor(private diffuseMap: string, private specularMap: string) {
        console.log('Material')
    }

    setUp(): void {
        console.log('setUp')
        // 需要在这里初始化texture吗
        // 纹理也需要存储在全局
    }
}
