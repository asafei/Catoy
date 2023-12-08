/** @format */

export class UniformSetter {
    static setValue(
        gl: WebGL2RenderingContext,
        location: WebGLUniformLocation,
        value: any,
        type: number,
        texture?: WebGLTexture,
    ): void {
        const callback = this.getSigularSetter(type)
        callback && callback(gl, location, value, texture)
    }

    static setValueV1f(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform1f(location, value)
    }
    static setValueV2f(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform2fv(location, value)
        // gl.uniform2f(location, value1, value2)
    }
    static setValueV3f(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform3fv(location, value)
        // gl.uniform3f(location, value[0], value[1], value[2])
    }
    static setValueV4f(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform4fv(location, value)
        // gl.uniform4f(location, value1, value2, value3, value4)
    }

    static setValueM2(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniformMatrix2fv(location, false, value)
    }

    static setValueM3(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniformMatrix3fv(location, false, value)
    }
    static setValueM4(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniformMatrix4fv(location, false, value)
    }

    // integer / boolean
    static setValueV1i(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform1i(location, value)
    }

    static setValueV2i(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform2iv(location, value)
        // gl.uniform2i( this.addr, value1, value2);
    }

    static setValueV3i(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform3iv(location, value)
        // gl.uniform3i( this.addr, value1, value2, value3);
    }

    static setValueV4i(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform4iv(location, value)
        // gl.uniform4i( this.addr, value1, value2, value3, value4);
    }

    // unsigned integer
    static setValueV1ui(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform1ui(location, value)
    }

    static setValueV2ui(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform2uiv(location, value)
        // gl.uniform2ui( this.addr, value1, value2);
    }

    static setValueV3ui(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform3uiv(location, value)
        // gl.uniform3ui( this.addr, value1, value2, value3);
    }

    static setValueV4ui(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform4uiv(location, value)
        // gl.uniform4ui( this.addr, value1, value2, value3, value4);
    }

    // sampler
    static setValueT1(
        gl: WebGL2RenderingContext,
        location: WebGLUniformLocation,
        value: any,
        texture?: WebGLTexture,
    ): void {
        gl.uniform1i(location, value)
        if (texture) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, texture)
        } else {
            gl.bindTexture(gl.TEXTURE_2D, null)
        }
    }

    static setValueT3D1(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform1i(location, value)
    }

    static setValueT6(
        gl: WebGL2RenderingContext,
        location: WebGLUniformLocation,
        value: any,
        texture?: WebGLTexture,
    ): void {
        gl.uniform1i(location, value)
        if (texture) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
        } else {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
        }
    }

    static setValueT2DArray1(gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: any): void {
        gl.uniform1i(location, value)
    }

    static getSigularSetter(type: number) {
        switch (type) {
            case 0x1406:
                return this.setValueV1f // FLOAT
            case 0x8b50:
                return this.setValueV2f // _VEC2
            case 0x8b51:
                return this.setValueV3f // _VEC3
            case 0x8b52:
                return this.setValueV4f // _VEC4

            case 0x8b5a:
                return this.setValueM2 // _MAT2
            case 0x8b5b:
                return this.setValueM3 // _MAT3
            case 0x8b5c:
                return this.setValueM4 // _MAT4

            case 0x1404:
            case 0x8b56:
                return this.setValueV1i // INT, BOOL
            case 0x8b53:
            case 0x8b57:
                return this.setValueV2i // _VEC2
            case 0x8b54:
            case 0x8b58:
                return this.setValueV3i // _VEC3
            case 0x8b55:
            case 0x8b59:
                return this.setValueV4i // _VEC4

            case 0x1405:
                return this.setValueV1ui // UINT
            case 0x8dc6:
                return this.setValueV2ui // _VEC2
            case 0x8dc7:
                return this.setValueV3ui // _VEC3
            case 0x8dc8:
                return this.setValueV4ui // _VEC4

            case 0x8b5e: // SAMPLER_2D
            case 0x8d66: // SAMPLER_EXTERNAL_OES
            case 0x8dca: // INT_SAMPLER_2D
            case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
            case 0x8b62: // SAMPLER_2D_SHADOW
                return this.setValueT1

            case 0x8b5f: // SAMPLER_3D
            case 0x8dcb: // INT_SAMPLER_3D
            case 0x8dd3: // UNSIGNED_INT_SAMPLER_3D
                return this.setValueT3D1

            case 0x8b60: // SAMPLER_CUBE
            case 0x8dcc: // INT_SAMPLER_CUBE
            case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
            case 0x8dc5: // SAMPLER_CUBE_SHADOW
                return this.setValueT6

            case 0x8dc1: // SAMPLER_2D_ARRAY
            case 0x8dcf: // INT_SAMPLER_2D_ARRAY
            case 0x8dd7: // UNSIGNED_INT_SAMPLER_2D_ARRAY
            case 0x8dc4: // SAMPLER_2D_ARRAY_SHADOW
                return this.setValueT2DArray1
        }
    }
}
