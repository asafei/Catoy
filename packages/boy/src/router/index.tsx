/** @format */

import React from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom'
import {Test} from '../page/Test'

const MyRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={Test}></Route>
        </Switch>
    </HashRouter>
)

export {MyRouter}
