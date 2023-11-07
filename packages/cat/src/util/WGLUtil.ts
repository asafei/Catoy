/** @format */

export class WGLUtil {
    public static createTextureAndBindData(
        gl: WebGL2RenderingContext,
        img: HTMLImageElement | HTMLImageElement[],
    ): WebGLTexture | null {
        const textureType = Array.isArray(img) ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D
        const texture = gl.createTexture() as WebGLTexture
        gl.bindTexture(textureType, texture)
        if (Array.isArray(img)) {
            for (let i = 0; i < 6; i++) {
                gl.texImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                    0,
                    gl.RGBA,
                    img[i].width,
                    img[i].height,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    img[i],
                )
            }
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
            gl.generateMipmap(gl.TEXTURE_2D)
        }
        gl.bindTexture(textureType, null)
        return texture
    }

    /**
     *
     * @param gl
     * @param bufferType gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER
     * @param data 类型化数据
     * @param usage gl.STATIC_DRAW
     * @returns
     */
    public static createBufferAndBindData(
        gl: WebGLRenderingContextBase,
        bufferType: GLenum,
        data: any,
        usage: GLenum,
    ): WebGLBuffer | null {
        const buffer = gl.createBuffer()
        gl.bindBuffer(bufferType, buffer)
        ;(gl as WebGLRenderingContext)?.bufferData(bufferType, data, usage)
        // (gl as WebGL2RenderingContext)?.bufferData(gl.ARRAY_BUFFER, data, usage);
        return buffer
    }

    /**
     * 根据着色器源码生成program
     */
    public static createProgramFromSources(
        gl: WebGLRenderingContextBase,
        vsSource: string,
        fsSource: string,
    ): WebGLProgram | undefined {
        const vsShader = this.createShader(gl, vsSource, gl.VERTEX_SHADER)
        const fsShader = this.createShader(gl, fsSource, gl.FRAGMENT_SHADER)
        if (vsShader && fsShader) {
            return this.createProgram(gl, vsShader, fsShader)
        }
    }

    /**
     * 根据vertexShader和fragmentShader生成program
     */
    private static createProgram(
        gl: WebGLRenderingContextBase,
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader,
    ): WebGLProgram | undefined {
        const program = gl.createProgram() as WebGLProgram
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        const success = gl.getProgramParameter(program, gl.LINK_STATUS)
        if (success) {
            return program
        }

        console.error('program 创建失败', gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
    }

    private static createShader(gl: WebGLRenderingContextBase, source: string, type: GLenum): WebGLShader | undefined {
        const shader = gl.createShader(type) as WebGLShader
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if (success) {
            return shader
        }

        //输出错误信息，删除shader
        console.error('shader 编译出错', gl.getShaderInfoLog(shader))
        console.error('shader 编译出错fg', source)

        gl.deleteShader(shader)
    }
}
