/** @format */

export class WebGLState {
    private capabilities: {[key: number]: boolean} = {}
    private funcCache: {[key: string]: number} = {}

    constructor(private gl: WebGL2RenderingContext) {}

    public enable(cap: number): void {
        if (this.capabilities[cap] !== true) {
            this.gl.enable(cap)
            this.capabilities[cap] = true
        }
    }

    public disable(cap: number): void {
        if (this.capabilities[cap] !== true) {
            this.gl.disable(cap)
            this.capabilities[cap] = false
        }
    }

    // TODO depthTest depthFunc depthMask 与buffer绑定
    public depthFunc(func: number): void {
        if (this.funcCache['depthFunc'] !== func) {
            this.gl.depthFunc(func)
            this.funcCache['depthFunc'] = func
        }
    }
}
