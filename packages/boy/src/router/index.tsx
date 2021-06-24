/** @format */

import React from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom'
import {Shadow, ShadowTest} from '../page'

const MyRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={ShadowTest}></Route>
        </Switch>
    </HashRouter>
)

export {MyRouter}
