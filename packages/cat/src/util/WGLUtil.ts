/** @format */

export class WGLUtil {
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
