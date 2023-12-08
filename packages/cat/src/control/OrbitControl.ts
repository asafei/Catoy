/** @format */

import {Camera} from '../camera/Camera'

export class OrbitControl {
    private AMORTIZATION = 0.8
    private drag = false
    private old_x!: number
    private old_y!: number
    private dX = 0
    private dY = 0
    private THETA = 0
    private PHI = 0

    private enaled = false

    constructor(private container: HTMLCanvasElement, private camera: Camera) {
        this.enable()
    }

    enable(): void {
        if (this.enaled) {
            return
        }
        this.container.addEventListener('mousedown', this.mouseDown, false)
        this.container.addEventListener('mouseup', this.mouseUp, false)
        this.container.addEventListener('mouseout', this.mouseUp, false)
        this.container.addEventListener('mousemove', this.mouseMove, false)
    }

    disable(): void {
        if (!this.enaled) {
            return
        }
        this.container.removeEventListener('mousedown', this.mouseDown, false)
        this.container.removeEventListener('mouseup', this.mouseUp, false)
        this.container.removeEventListener('mouseout', this.mouseUp, false)
        this.container.removeEventListener('mousemove', this.mouseMove, false)
    }

    resize(): void {
        // todo
    }

    update() {
        if (!this.drag) {
            this.dX *= this.AMORTIZATION
            this.dY *= this.AMORTIZATION
            this.THETA += this.dX
            this.PHI += this.dY
        }

        // 假定为第三视角
        const x = 5 * Math.cos(this.PHI) * Math.cos(this.THETA)
        const y = 5 * Math.cos(this.PHI) * Math.sin(-this.THETA)
        const z = 5 * Math.sin(this.PHI)
        // z朝上
        // this.camera.lookAt([x, y, z], [0, 0, 0])

        // y朝上
        this.camera.lookAt([x, z, -y], [0, 0, 0])
    }

    private mouseDown = (e: any) => {
        this.drag = true
        ;(this.old_x = e.pageX), (this.old_y = e.pageY)
        e.preventDefault()
        return
    }

    private mouseUp = (e: any) => {
        this.drag = false
        return
    }

    private mouseMove = (e: any) => {
        if (!this.drag) return false
        ;(this.dX = ((e.pageX - this.old_x) * 2 * Math.PI) / this.container.width),
            (this.dY = ((e.pageY - this.old_y) * 2 * Math.PI) / this.container.height)
        this.THETA += this.dX
        this.PHI += this.dY
        this.PHI = Math.max(-1.56, Math.min(this.PHI, 1.56))
        ;(this.old_x = e.pageX), (this.old_y = e.pageY)
        e.preventDefault()
    }
}
