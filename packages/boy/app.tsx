/** @format */

import React from 'react'
import ReactDOM from 'react-dom'
import {MyRouter} from './src/router'

const div = document.createElement('div')
div.style.width = '100%'
div.style.height = '100%'
div.style.background = 'red'
document.body.appendChild(div)

ReactDOM.render(<MyRouter />, div)
