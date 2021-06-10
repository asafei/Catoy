/** @format */

import React from 'react'
import {HashRouter, Route, Switch, hashHistory} from 'react-router-dom'
import {Test} from '../page/Test.js'

const MyRouter = () => (
    <HashRouter history={hashHistory}>
        <Switch>
            <Route exact path="/" component={Test}></Route>
        </Switch>
    </HashRouter>
)

export {MyRouter}
