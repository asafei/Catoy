/** @format */

import {Context} from 'vm'

export class Base {
    /**
     * 重置视口
     * @param  {[type]} canvas     [description]
     * @param  {Number} multiplier [description]
     * @return {[type]}            [description]
     */
    static resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier = 1) {
        const width = (canvas.clientWidth * multiplier) | 0
        const height = (canvas.clientHeight * multiplier) | 0
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
            return true
        }
        return false
    }

    /**
     * 弧度转化为角度
     * @param  {[type]} r [description]
     * @return {[type]}   [description]
     */
    static radToDeg(r: number): number {
        return (r * 180) / Math.PI
    }

    /**
     * 角度转化为弧度
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    static degToRad(d: number): number {
        return (d * Math.PI) / 180
    }

    /**
     * 节流函数
     * @param  {Function} fn      [description]
     * @param  {[type]}   time    [description]
     * @param  {[type]}   context [description]
     * @return {[type]}           [description]
     */
    static throttle(fn: any, time: number, context: Context) {
        let lock: boolean
        let innerArgs: any

        const later = function () {
            // reset lock and call if queued
            lock = false
            if (innerArgs) {
                wrapperFn.apply(context, innerArgs)
                innerArgs = false
            }
        }

        const wrapperFn = function (...args: any[]) {
            if (lock) {
                // called too soon, queue to call later
                innerArgs = args
            } else {
                // call and lock until later
                fn.apply(context, args)
                setTimeout(later, time)
                lock = true
            }
        }

        return wrapperFn
    }
}
