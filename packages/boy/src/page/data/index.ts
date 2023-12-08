/* eslint-disable prettier/prettier */
/** @format */

// 创建平面 y轴朝上
export function createPlane4(side = 4, height = -1): any {
    const half_side = side / 2
    // positions          // normals           // texture coords
    const vertices = [
        -half_side, height, half_side, 0, 1, 0, 0.0, 0.0,
        -half_side, height, -half_side, 0, 1, 0, 0.0, 0.0,
        half_side, height, -half_side, 0, 1, 0, 0.0, 0.0,
        -half_side, height, half_side, 0, 1, 0, 0.0, 0.0,
        half_side, height, -half_side, 0, 1, 0, 0.0, 0.0,
        half_side, height, half_side, 0, 1, 0, 0.0, 0.0,
    ]

    return vertices
}

export function createCube3() {
    const vertices = [
        // positions
        -0.5,  0.5, -0.5, 0, 0, -1, 0.0, 0.0,
        -0.5, -0.5, -0.5, 0, 0, -1, 1.0, 0.0,
         0.5, -0.5, -0.5, 0, 0, -1, 1.0, 1.0,
         0.5, -0.5, -0.5, 0, 0, -1, 1.0, 1.0,
         0.5,  0.5, -0.5, 0, 0, -1, 0.0, 1.0,
        -0.5,  0.5, -0.5, 0, 0, -1, 0.0, 0.0,
    
        -0.5, -0.5,  0.5, -1, 0, 0, 1.0, 0.0,
        -0.5, -0.5, -0.5, -1, 0, 0, 1.0, 1.0,
        -0.5,  0.5, -0.5, -1, 0, 0, 0.0, 1.0,
        -0.5,  0.5, -0.5, -1, 0, 0, 0.0, 1.0,
        -0.5,  0.5,  0.5, -1, 0, 0, 0.0, 0.0,
        -0.5, -0.5,  0.5, -1, 0, 0, 1.0, 0.0,
    
         0.5, -0.5, -0.5, 1, 0, 0, 0.0, 0.0,
         0.5, -0.5,  0.5, 1, 0, 0, 1.0, 0.0,
         0.5,  0.5,  0.5, 1, 0, 0, 1.0, 1.0,
         0.5,  0.5,  0.5, 1, 0, 0, 1.0, 1.0,
         0.5,  0.5, -0.5, 1, 0, 0, 0.0, 1.0,
         0.5, -0.5, -0.5, 1, 0, 0, 0.0, 0.0,
    
        -0.5, -0.5,  0.5, 0, 0, 1, 0.0, 0.0,
        -0.5,  0.5,  0.5, 0, 0, 1, 1.0, 0.0,
         0.5,  0.5,  0.5, 0, 0, 1, 1.0, 1.0,
         0.5,  0.5,  0.5, 0, 0, 1, 1.0, 1.0,
         0.5, -0.5,  0.5, 0, 0, 1, 0.0, 1.0,
        -0.5, -0.5,  0.5, 0, 0, 1, 0.0, 0.0,
    
        -0.5,  0.5, -0.5, 0, 1, 0, 0.0, 1.0,
         0.5,  0.5, -0.5, 0, 1, 0, 1.0, 1.0,
         0.5,  0.5,  0.5, 0, 1, 0, 1.0, 0.0,
         0.5,  0.5,  0.5, 0, 1, 0, 1.0, 0.0,
        -0.5,  0.5,  0.5, 0, 1, 0, 0.0, 0.0,
        -0.5,  0.5, -0.5, 0, 1, 0, 0.0, 1.0,
    
        -0.5, -0.5, -0.5, 0, -1, 0, 0.0, 0.0,
        -0.5, -0.5,  0.5, 0, -1, 0, 0.0, 1.0,
         0.5, -0.5, -0.5, 0, -1, 0, 1.0, 0.0,
         0.5, -0.5, -0.5, 0, -1, 0, 1.0, 0.0,
        -0.5, -0.5,  0.5, 0, -1, 0, 0.0, 1.0,
         0.5, -0.5,  0.5, 0, -1, 0, 1.0, 1.0,
    ]
    return vertices
}

// 创建立着的面
export function createPlane3(): any {
    const vertices = [
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0, 1.0,
        0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0, 1.0,
        0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0, 0.0,
        0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0, 0.0,
       -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0, 0.0,
       -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0, 1.0
    ]

    return vertices
}

// 创建平面 z轴朝上
export function createPlane2(side = 4, height = -1): any {
    const half_side = side / 2
    // positions          // normals           // texture coords
    const vertices = [
        -half_side, half_side, height, 0, 0, 1, 0.0, 0.0,
        -half_side, -half_side, height, 0, 0, 1, 0.0, 0.0,
        half_side, -half_side, height, 0, 0, 1, 0.0, 0.0,
        -half_side, half_side, height, 0, 0, 1, 0.0, 0.0,
        half_side, -half_side, height, 0, 0, 1, 0.0, 0.0,
        half_side, half_side, height, 0, 0, 1, 0.0, 0.0,
    ]

    return vertices
}
export function createPlane(side = 4, height = -1): any {
    const verticesData = []
    const normalsData = []
    const indicesData = []
    const uvsData = []

    const half_side = side / 2
    verticesData.push(-half_side, half_side, height)
    verticesData.push(-half_side, -half_side, height)
    verticesData.push(half_side, -half_side, height)
    verticesData.push(half_side, half_side, height)

    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)

    indicesData.push(0, 1, 2, 0, 2, 3)

    const vertices = new Float32Array(verticesData)
    const normals = new Float32Array(normalsData)
    const numVertices = vertices.length / 3
    let indices
    if (numVertices > 65535) {
        indices = new Uint32Array(indicesData)
    } else {
        indices = new Uint16Array(indicesData)
    }
    return {indices, vertices, normals}
}

// z 朝上
export function createCube2() {
    // positions          // normals           // texture coords
    const vertices = [
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0,
         0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 0.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0,
    
        -0.5, -0.5,  0.5,  0.0,  0.0, 1.0,   0.0, 0.0,
         0.5, -0.5,  0.5,  0.0,  0.0, 1.0,   1.0, 0.0,
         0.5,  0.5,  0.5,  0.0,  0.0, 1.0,   1.0, 1.0,
         0.5,  0.5,  0.5,  0.0,  0.0, 1.0,   1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0,  0.0, 1.0,   0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0,  0.0, 1.0,   0.0, 0.0,
    
        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0, 0.0,
        -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,  1.0, 1.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0, 1.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0, 1.0,
        -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,  0.0, 0.0,
        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0, 0.0,
    
         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0,  0.0,  0.0,  1.0, 1.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0, 1.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0, 1.0,
         0.5, -0.5,  0.5,  1.0,  0.0,  0.0,  0.0, 0.0,
         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0, 0.0,
    
        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0, 1.0,
         0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0, 1.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0, 0.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0, 0.0,
        -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0, 0.0,
        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0, 1.0,
    
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0, 1.0,
         0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0, 1.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0, 0.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0, 0.0,
        -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0, 0.0,
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0, 1.0
    ]

    return vertices
}

export function createCube(side = 1): any {
    const verticesData = []
    const normalsData = []
    const indicesData = []
    const uvsData = []

    const half_side = side / 2

    verticesData.push(-half_side, half_side, half_side)
    verticesData.push(-half_side, -half_side, half_side)
    verticesData.push(half_side, -half_side, half_side)
    verticesData.push(half_side, half_side, half_side)
    verticesData.push(-half_side, half_side, -half_side)
    verticesData.push(-half_side, -half_side, -half_side)
    verticesData.push(half_side, -half_side, -half_side)
    verticesData.push(half_side, half_side, -half_side)

    const normalizeData = new Float32Array([1, 1, 1])
    const dataNormal = new Float32Array([half_side, half_side, half_side])
    normalize(normalizeData, dataNormal)

    normalsData.push(-normalizeData[0], normalizeData[0], normalizeData[0])
    normalsData.push(-normalizeData[0], -normalizeData[0], normalizeData[0])
    normalsData.push(normalizeData[0], -normalizeData[0], normalizeData[0])
    normalsData.push(normalizeData[0], normalizeData[0], normalizeData[0])

    normalsData.push(-normalizeData[0], normalizeData[0], -normalizeData[0])
    normalsData.push(-normalizeData[0], -normalizeData[0], -normalizeData[0])
    normalsData.push(normalizeData[0], -normalizeData[0], -normalizeData[0])
    normalsData.push(normalizeData[0], normalizeData[0], -normalizeData[0])

    indicesData.push(
        0,
        1,
        2,
        0,
        2,
        3,
        7,
        6,
        5,
        7,
        5,
        4,
        0,
        4,
        5,
        0,
        5,
        1,
        1,
        5,
        6,
        1,
        6,
        2,
        2,
        6,
        7,
        2,
        7,
        3,
        3,
        7,
        4,
        3,
        4,
        0,
    )

    const vertices = new Float32Array(verticesData)
    const normals = new Float32Array(normalsData)
    const numVertices = vertices.length / 3
    let indices
    if (numVertices > 65535) {
        indices = new Uint32Array(indicesData)
    } else {
        indices = new Uint16Array(indicesData)
    }
    // const uvs = new Float32Array(uvsData)

    return {indices, vertices, normals}
}

export function createPlane_pre(radius = 1): any {
    const verticesData = []
    const normalsData = []
    const indicesData = []
    const uvsData = []

    verticesData.push(-3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, 3 * radius, -radius - 0.01)
    verticesData.push(-3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, 3 * radius, -radius - 0.01)
    verticesData.push(-3 * radius, 3 * radius, -radius - 0.01)

    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)

    uvsData.push(0, 0)
    uvsData.push(1, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 1)

    const temp = verticesData.length / 3

    indicesData.push(temp - 12, temp - 10, temp - 11)
    indicesData.push(temp - 9, temp - 7, temp - 8)
    indicesData.push(temp - 6, temp - 5, temp - 4)
    indicesData.push(temp - 3, temp - 2, temp - 1)

    const vertices = new Float32Array(verticesData)
    const normals = new Float32Array(normalsData)
    const numVertices = vertices.length / 3
    let indices
    if (numVertices > 65535) {
        indices = new Uint32Array(indicesData)
    } else {
        indices = new Uint16Array(indicesData)
    }
    const uvs = new Float32Array(uvsData)

    return {indices, vertices, normals, uvs}
}

export function createSphere(angle = Math.PI, radius = 1.0, facet = 200): any {
    const verticesData = []
    const normalsData = []
    const indicesData = []
    const uvsData = []
    let count = 0

    verticesData[0] = 0
    verticesData[1] = 0
    verticesData[2] = -radius
    normalsData[0] = 0
    normalsData[1] = 0
    normalsData[2] = -1
    uvsData[0] = 0.5
    uvsData[1] = 0.0

    let m = 3

    const point = new Float32Array(3)
    const theta = angle / facet
    const phi = (2 * Math.PI) / facet

    for (let thetaCount = 1; thetaCount < facet; ++thetaCount) {
        const XY = Math.sin(thetaCount * theta) * radius
        const Z = -Math.cos(thetaCount * theta) * radius
        for (let phiCount = 0; phiCount < facet + 1; ++phiCount) {
            const X = XY * Math.sin(phiCount * phi)
            const Y = XY * Math.cos(phiCount * phi)
            verticesData[m] = X
            verticesData[m + 1] = Y
            verticesData[m + 2] = Z
            point[0] = X
            point[1] = Y
            point[2] = Z
            normalize(point, point)
            normalsData[m] = point[0]
            normalsData[m + 1] = point[1]
            normalsData[m + 2] = point[2]
            uvsData.push(1.0 - phiCount / facet)
            uvsData.push(thetaCount / facet)
            m += 3
        }
    }

    verticesData[m] = 0
    verticesData[m + 1] = 0
    verticesData[m + 2] = angle === Math.PI ? radius : 0
    normalsData[m] = 0
    normalsData[m + 1] = 0
    normalsData[m + 2] = 1
    uvsData.push(0.5)
    uvsData.push(1.0)

    // First Sphere ring(formed by triangles)
    for (let i = 0; i < facet; ++i) {
        indicesData[count++] = 0
        indicesData[count++] = i + 1
        indicesData[count++] = i + 2
    }

    // Sphere rings loop(formed by rectangulars, 2 triangles for a rectangular)
    for (let i = 1; i < facet - 1; ++i) {
        const currentRing = (i - 1) * (facet + 1) + 1
        const nextRing = currentRing + facet + 1
        for (let j = 0; j < facet; ++j) {
            indicesData[count++] = currentRing + j
            indicesData[count++] = nextRing + j
            indicesData[count++] = currentRing + j + 1
            indicesData[count++] = nextRing + j
            indicesData[count++] = nextRing + j + 1
            indicesData[count++] = currentRing + j + 1
        }
    }

    // Last Sphere ring(formed by triangles)
    const pointIndex = verticesData.length / 3 - 1
    for (let i = 0; i < facet; ++i) {
        indicesData[count++] = pointIndex
        indicesData[count++] = pointIndex - i - 1
        indicesData[count++] = pointIndex - i - 2
    }

    /*
    verticesData.push(-3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, 3 * radius, -radius - 0.01)
    verticesData.push(-3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, 3 * radius, -radius - 0.01)
    verticesData.push(-3 * radius, 3 * radius, -radius - 0.01)

    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)

    uvsData.push(0, 0)
    uvsData.push(1, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 1)

    const temp = verticesData.length / 3

    indicesData.push(temp - 12, temp - 10, temp - 11)
    indicesData.push(temp - 9, temp - 7, temp - 8)
    indicesData.push(temp - 6, temp - 5, temp - 4)
    indicesData.push(temp - 3, temp - 2, temp - 1)
    */

    const vertices = new Float32Array(verticesData)
    const normals = new Float32Array(normalsData)
    const numVertices = vertices.length / 3
    let indices
    if (numVertices > 65535) {
        indices = new Uint32Array(indicesData)
    } else {
        indices = new Uint16Array(indicesData)
    }
    const uvs = new Float32Array(uvsData)

    return {indices, vertices, normals, uvs}
}

export function createShape(angle = Math.PI, radius = 1.0, facet = 200) {
    const verticesData = []
    const normalsData = []
    const indicesData = []
    const uvsData = []
    let count = 0

    verticesData[0] = 0
    verticesData[1] = 0
    verticesData[2] = -radius
    normalsData[0] = 0
    normalsData[1] = 0
    normalsData[2] = -1
    uvsData[0] = 0.5
    uvsData[1] = 0.0

    let m = 3

    const point = new Float32Array(3)
    const theta = angle / facet
    const phi = (2 * Math.PI) / facet

    for (let thetaCount = 1; thetaCount < facet; ++thetaCount) {
        const XY = Math.sin(thetaCount * theta) * radius
        const Z = -Math.cos(thetaCount * theta) * radius
        for (let phiCount = 0; phiCount < facet + 1; ++phiCount) {
            const X = XY * Math.sin(phiCount * phi)
            const Y = XY * Math.cos(phiCount * phi)
            verticesData[m] = X
            verticesData[m + 1] = Y
            verticesData[m + 2] = Z
            point[0] = X
            point[1] = Y
            point[2] = Z
            normalize(point, point)
            normalsData[m] = point[0]
            normalsData[m + 1] = point[1]
            normalsData[m + 2] = point[2]
            uvsData.push(1.0 - phiCount / facet)
            uvsData.push(thetaCount / facet)
            m += 3
        }
    }

    verticesData[m] = 0
    verticesData[m + 1] = 0
    verticesData[m + 2] = angle === Math.PI ? radius : 0
    normalsData[m] = 0
    normalsData[m + 1] = 0
    normalsData[m + 2] = 1
    uvsData.push(0.5)
    uvsData.push(1.0)

    // First Sphere ring(formed by triangles)
    for (let i = 0; i < facet; ++i) {
        indicesData[count++] = 0
        indicesData[count++] = i + 1
        indicesData[count++] = i + 2
    }

    // Sphere rings loop(formed by rectangulars, 2 triangles for a rectangular)
    for (let i = 1; i < facet - 1; ++i) {
        const currentRing = (i - 1) * (facet + 1) + 1
        const nextRing = currentRing + facet + 1
        for (let j = 0; j < facet; ++j) {
            indicesData[count++] = currentRing + j
            indicesData[count++] = nextRing + j
            indicesData[count++] = currentRing + j + 1
            indicesData[count++] = nextRing + j
            indicesData[count++] = nextRing + j + 1
            indicesData[count++] = currentRing + j + 1
        }
    }

    // Last Sphere ring(formed by triangles)
    const pointIndex = verticesData.length / 3 - 1
    for (let i = 0; i < facet; ++i) {
        indicesData[count++] = pointIndex
        indicesData[count++] = pointIndex - i - 1
        indicesData[count++] = pointIndex - i - 2
    }

    verticesData.push(-3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, -3 * radius, -radius)
    verticesData.push(3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, 3 * radius, -radius)
    verticesData.push(-3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, 3 * radius, -radius - 0.01)
    verticesData.push(-3 * radius, -3 * radius, -radius - 0.01)
    verticesData.push(3 * radius, 3 * radius, -radius - 0.01)
    verticesData.push(-3 * radius, 3 * radius, -radius - 0.01)

    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)
    normalsData.push(0, 0, 1)

    uvsData.push(0, 0)
    uvsData.push(1, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 0)
    uvsData.push(1, 1)
    uvsData.push(0, 1)

    const temp = verticesData.length / 3

    indicesData.push(temp - 12, temp - 10, temp - 11)
    indicesData.push(temp - 9, temp - 7, temp - 8)
    indicesData.push(temp - 6, temp - 5, temp - 4)
    indicesData.push(temp - 3, temp - 2, temp - 1)

    const vertices = new Float32Array(verticesData)
    const normals = new Float32Array(normalsData)
    const numVertices = vertices.length / 3
    let indices
    if (numVertices > 65535) {
        indices = new Uint32Array(indicesData)
    } else {
        indices = new Uint16Array(indicesData)
    }
    const uvs = new Float32Array(uvsData)

    return {indices, vertices, normals, uvs}
}

function normalize(out: Float32Array, a: Float32Array) {
    const x = a[0]
    const y = a[1]
    const z = a[2]
    let len = x * x + y * y + z * z
    if (len > 0) {
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}
