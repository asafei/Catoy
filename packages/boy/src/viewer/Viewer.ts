/** @format */

import {Camera, OrbitControl} from 'cat'
import '../css/index.css'

export class Viewr {
    private ref!: number

    private canvas: HTMLCanvasElement
    private gl: WebGLRenderingContextBase
    private control: OrbitControl
    private camera: Camera
    // private scene : Screen;
    // private renderer:Renderer;

    constructor(div: HTMLElement) {
        this.canvas = document.createElement('canvas')
        this.canvas.className = 'canvas'
        this.canvas.width = div.clientWidth | window.innerWidth
        this.canvas.height = div.clientHeight | window.innerHeight
        div.appendChild(this.canvas)

        // TODO 收拢到render
        const gl = this.canvas.getContext('webgl')
        if (!gl) {
            throw new Error('can not get WebGLContext!')
        }
        this.gl = gl

        this.camera = new Camera()
        this.control = new OrbitControl(this.canvas, this.camera)
    }

    render(): void {
        if (this.ref) {
            this.pause()
        }
        this.run()
    }

    private run = () => {
        console.log('runing--')
        const gl = this.gl
        this.control.update()

        //宝贝，我是你爹呀

        // gl.useProgram(mainProgram)
        // gl.enable(gl.DEPTH_TEST)
        // gl.depthMask(true)
        // gl.depthFunc(gl.LEQUAL)
        // gl.clearColor(0.8, 0.6, 0.9, 1)
        // gl.clearDepth(1.0)
        // gl.viewport(0.0, 0.0, canvas.width, canvas.height)
        // // console.log(canvas.width,canvas.height);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // gl.uniformMatrix4fv(main_objectModelMatrixLocation, false, objectModelMatrix)
        // gl.uniformMatrix4fv(main_cameraProjectionLocation, false, perspectiveProjectionMatrix)
        // gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, camera.cameraViewMatrix)
        // // gl.uniformMatrix4fv(main_cameraProjectionLocation, false, orthoProjection)
        // // gl.uniformMatrix4fv(main_cameraViewMatrixLocation, false, lightViewMatrix)

        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
        // gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

        this.ref = requestAnimationFrame(this.run)
    }

    private pause(): void {
        cancelAnimationFrame(this.ref)
    }
}
