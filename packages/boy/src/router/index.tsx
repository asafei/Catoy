/** @format */

import React from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom'
import {
    Shadow,
    ShadowTest,
    LightTest,
    Light1,
    Light2,
    Light3,
    Light4,
    Light5,
    Light6,
    Light7,
    Light8,
    FragCoord,
    DepthDemo,
    StencilDemo,
    BlendingDemo,
    FaceCullingDemo,
    FramebufferDemo,
    CubeMapDemo,
    CubeMapDemo2,
    CubeMapDemo3,
} from '../page'

const MyRouter = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/" component={CubeMapDemo3}></Route>
            <Route exact path="/cubeMapDemo2" component={CubeMapDemo2}></Route>
            <Route exact path="/cubeMapDemo" component={CubeMapDemo}></Route>
            <Route exact path="/framebufferDemo" component={FramebufferDemo}></Route>
            <Route exact path="/faceCullingDemo" component={FaceCullingDemo}></Route>
            <Route exact path="/blendingDemo" component={BlendingDemo}></Route>
            <Route exact path="/stencilDemo" component={StencilDemo}></Route>
            <Route exact path="/fragCoord" component={FragCoord}></Route>
            <Route exact path="/depthDemo" component={DepthDemo}></Route>
            <Route exact path="/light8" component={Light8}></Route>
            <Route exact path="/light7" component={Light7}></Route>
            <Route exact path="/light6" component={Light6}></Route>
            <Route exact path="/light5" component={Light5}></Route>
            <Route exact path="/light4" component={Light4}></Route>
            <Route exact path="/light3" component={Light3}></Route>
            <Route exact path="/light2" component={Light2}></Route>
            <Route exact path="/light1" component={Light1}></Route>
            <Route exact path="/shadowTest" component={ShadowTest}></Route>
        </Switch>
    </HashRouter>
)

export {MyRouter}
