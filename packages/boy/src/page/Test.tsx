/** @format */

import React from 'react'
import {Test as TestCat} from 'cat'

function Test() {
    const t = new TestCat()
    const n = t.getNumber()
    return <div>{n}</div>
}

export {Test}
