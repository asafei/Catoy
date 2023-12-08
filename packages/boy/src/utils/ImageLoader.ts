/** @format */

export class ImageLoader {
    static loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.src = url
            image.crossOrigin = 'anonymous'
            image.addEventListener('load', () => {
                console.log('image load success！')
                resolve(image)
            })
        })
    }
}
