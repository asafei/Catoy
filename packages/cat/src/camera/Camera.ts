/** @format */

export class Camera {
    public cameraViewMatrix = new Float32Array(16)
    public cameraProjectionMatrix = new Float32Array(16)
    private position: number[] = [1, 0, 0]
    private target: number[] = [0, 0, 0]
    private up = [0, 0, 1]

    private directon: number[] = [1, 0, 0]

    getProjection(): Float32Array {
        throw new Error('Method not implemented.')
    }

    lookAt(position: number[], target: number[]) {
        this.position = position
        this.target = target

        const direction = [
            this.position[0] - this.target[0],
            this.position[1] - this.target[1],
            this.position[2] - this.target[2],
        ]
        normalize(this.directon, direction)
        _lookAt(this.cameraViewMatrix, position, target, this.up)
    }
}

function _lookAt(out: Float32Array, eye: number[], center: number[], up: number[]) {
    let x0 = 0,
        x1 = 0,
        x2 = 0,
        y0 = 0,
        y1 = 0,
        y2 = 0,
        z0 = 0,
        z1 = 0,
        z2 = 0,
        len = 0
    const eyex = eye[0]
    const eyey = eye[1]
    const eyez = eye[2]
    const upx = up[0]
    const upy = up[1]
    const upz = up[2]
    const centerx = center[0]
    const centery = center[1]
    const centerz = center[2]

    if (Math.abs(eyex - centerx) < 1e-6 && Math.abs(eyey - centery) < 1e-6 && Math.abs(eyez - centerz) < 1e-6) {
        return identity(out)
    }

    z0 = eyex - centerx
    z1 = eyey - centery
    z2 = eyez - centerz

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2)
    z0 *= len
    z1 *= len
    z2 *= len

    x0 = upy * z2 - upz * z1
    x1 = upz * z0 - upx * z2
    x2 = upx * z1 - upy * z0
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2)
    if (!len) {
        x0 = 0
        x1 = 0
        x2 = 0
    } else {
        len = 1 / len
        x0 *= len
        x1 *= len
        x2 *= len
    }

    y0 = z1 * x2 - z2 * x1
    y1 = z2 * x0 - z0 * x2
    y2 = z0 * x1 - z1 * x0

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2)
    if (!len) {
        y0 = 0
        y1 = 0
        y2 = 0
    } else {
        len = 1 / len
        y0 *= len
        y1 *= len
        y2 *= len
    }

    out[0] = x0
    out[1] = y0
    out[2] = z0
    out[3] = 0
    out[4] = x1
    out[5] = y1
    out[6] = z1
    out[7] = 0
    out[8] = x2
    out[9] = y2
    out[10] = z2
    out[11] = 0
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez)
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez)
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez)
    out[15] = 1

    return out
}

function identity(m: Float32Array) {
    m[0] = 1
    m[1] = 0
    m[2] = 0
    m[3] = 0

    m[4] = 0
    m[5] = 1
    m[6] = 0
    m[7] = 0

    m[8] = 0
    m[9] = 0
    m[10] = 1
    m[11] = 0

    m[12] = 0
    m[13] = 0
    m[14] = 0
    m[15] = 1
    return m
}

function normalize(out: number[], a: number[]) {
    const x = a[0]
    const y = a[1]
    const z = a[2]
    let len = x * x + y * y + z * z
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}
