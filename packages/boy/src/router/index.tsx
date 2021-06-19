/** @format */

import React from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom'
import {Shadow} from '../page'

const MyRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={Shadow}></Route>
        </Switch>
    </HashRouter>
)

export {MyRouter}
