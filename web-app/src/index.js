import React from 'react'
import ReactDOM from 'react-dom'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import App from './App'
import {BrowserRouter} from 'react-router-dom'
import * as serviceWorker from './serviceWorker'

// redux
import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import logger from 'redux-logger'
import reducer from './reducer'

let middlewares = []
if (process.env.NODE_ENV === "development") {
  middlewares.push(logger)
}

const store = createStore(reducer, applyMiddleware(...middlewares))

// TODO load account
// TODO listen for account change

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
