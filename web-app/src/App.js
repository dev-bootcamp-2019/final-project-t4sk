import React, { Component } from 'react'
import {Route, Switch} from 'react-router-dom'
import {Container, Button} from 'semantic-ui-react'
import Navigation from './components/navigation'
import Home from './components/home'
import CreateSubscription from './components/create-subscription'
import Subscription from './components/subscription'
import Bounties from './components/bounties'
import CreateBounty from './components/create-bounty'
import Bounty from './components/bounty'

class App extends Component {
  render() {
    return (
      <div>
        <Navigation />
        <Container>
          <Switch>
            <Route path="/subscriptions/new" component={CreateSubscription} />
            <Route path="/subscriptions/:address" component={Subscription} />
            <Route path="/bounties/new" component={CreateBounty} />
            <Route path="/bounties/:bountyId" component={Bounty} />
            <Route path="/bounties" component={Bounties} />
            <Route component={Home} />
          </Switch>
        </Container>
        <div style={{padding: 30}} />
      </div>
    )
  }
}

export default App
