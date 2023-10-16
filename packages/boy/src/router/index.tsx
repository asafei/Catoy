/** @format */

import React from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom'
import {Shadow, ShadowTest, LightTest, Light1, Light2, Light3, Light4} from '../page'

const MyRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={Light4}></Route>
            <Route exact path="/light3" component={Light3}></Route>
            <Route exact path="/light2" component={Light2}></Route>
            <Route exact path="/light1" component={Light1}></Route>
            <Route exact path="/shadowTest" component={ShadowTest}></Route>
        </Switch>
    </HashRouter>
)

export {MyRouter}
