/** @format */

export class Actor {
    parent: Actor | null = null
    children: Actor[] = []

    add(actor: Actor): void {
        this.children.push(actor)
    }

    remove(actor: Actor): void {
        for (let i = this.children.length - 1; i >= 0; i--) {
            if (this.children[i] === actor) {
                this.children.splice(i, 1)
                break
            }
        }
    }

    traverse(callback: (actor: Actor) => void): void {
        callback(this)
        const children = this.children
        for (let i = 0, l = children.length; i < l; i++) {
            children[i].traverse(callback)
        }
    }
}
