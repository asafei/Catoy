/** @format */

import {AbstractLight, OrbitControl, Scene, PerspectiveCamera, WebGLRenderer, Model} from 'cat'
import '../css/index.css'
import {Color, ImageCube} from 'cat/src/core'

export class Viewer {
    private ref!: number

    private canvas: HTMLCanvasElement
    private control: OrbitControl
    private camera: PerspectiveCamera
    private scene: Scene
    private renderer: WebGLRenderer

    set background(background: undefined | Color | ImageCube) {
        this.scene.background = background
    }

    get background(): undefined | Color | ImageCube {
        return this.scene.background
    }

    constructor(div: HTMLElement) {
        this.canvas = document.createElement('canvas')
        this.canvas.className = 'canvas'
        this.canvas.width = div.clientWidth | window.innerWidth
        this.canvas.height = div.clientHeight | window.innerHeight
        div.appendChild(this.canvas)

        this.renderer = new WebGLRenderer(this.canvas)
        this.scene = new Scene()
        this.camera = new PerspectiveCamera(Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 1000)
        this.control = new OrbitControl(this.canvas, this.camera)

        window?.addEventListener('resize', () => {
            this.canvas.width = div?.clientWidth | window.innerWidth
            this.canvas.height = div?.clientHeight | window.innerHeight
            this.camera.updateProjectionMatrix(Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 1000)
        })
    }

    addModel(model: Model): void {
        this.scene.add(model)
    }

    addLight(light: AbstractLight): void {
        this.scene.add(light)
    }

    prepare(): void {
        this.renderer.prepare(this.scene)
    }

    render(): void {
        if (this.ref) {
            this.pause()
        }
        this.run()
    }

    private run = () => {
        this.control.update()

        this.renderer.render(this.camera)

        this.ref = requestAnimationFrame(this.run)
    }

    private pause(): void {
        cancelAnimationFrame(this.ref)
    }
}
