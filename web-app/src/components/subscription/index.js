import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Menu, Container, Table, Button, Message} from 'semantic-ui-react'
import { compose } from '../../util'
import * as api from '../../api'
import Loading from '../loading'
import requireAccount from '../require-account'
import createQuery from '../create-query'
import createMutation from '../create-mutation'
import Subscriber from './subscriber'
import Subscribers from './subscribers'

// TODO register / unregister bounty if owner

class Subscription extends Component {
  componentDidMount() {
    if (!this.props.account.web3) {
      this.props.requireAccount()
      return
    }

    this.fetch()
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.account.web3 && this.props.account.web3) {
      this.fetch()
    }
  }

  fetch = () => {
    this.props.query.fetch({
      web3: this.props.account.web3,
      address: this.props.match.params.address
    })
  }

  deleteSubscription = async () => {
    const { web3 } = this.props.account

    await this.props.deleteSubscription.save({
      web3,
      address: this.props.match.params.address,
    })

    this.props.history.replace('/')
  }

  isOwner() {
    const { account, query: { response } } = this.props
    return (
      response &&
      response.owner.toLowerCase() == account.address.toLowerCase()
    )
  }

  render() {
    const { address } = this.props.match.params
    const { query } = this.props
    const { response } = query

    return (
      <Container>
        <Menu secondary>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              Address
            </h3>
            <div style={{ marginLeft: 5, color: "#999999" }}>
              {address}
            </div>
          </div>

          {response && this.isOwner() && (
            <Menu.Item position="right">
              <Button
                inverted
                color="red"
                disabled={this.props.deleteSubscription.saving}
                onClick={this.deleteSubscription}
              >
                Delete
              </Button>
            </Menu.Item>
          )}
        </Menu>

        {this.props.deleteSubscription.error && (
          <Message negative>
            <p>{`${this.props.deleteSubscription.error}`}</p>
          </Message>
        )}

        <Loading
          loading={query.fetching}
          error={query.error}
          onRetry={this.fetch}
        >
          {response && (
            <React.Fragment>
              <Table>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>
                      Owner
                    </Table.Cell>
                    <Table.Cell>
                      {response.owner}
                    </Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell>
                      Token
                    </Table.Cell>
                    <Table.Cell>
                      {response.token}
                    </Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell>
                      Payment Amount
                    </Table.Cell>
                    <Table.Cell>
                      {response.paymentAmount} tokens
                    </Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell>
                      Payment Interval
                    </Table.Cell>
                    <Table.Cell>
                      {response.paymentInterval} seconds
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>

              {this.isOwner() ? (
                <React.Fragment>
                  <h5>Subscribers</h5>
                  <Subscribers
                    subscriptionAddress={this.props.match.params.address}
                  />
                </React.Fragment>
              ) : (
                <Subscriber
                  subscriptionAddress={this.props.match.params.address}
                  tokenAddress={response.token}
                />
              )}
            </React.Fragment>
          )}
        </Loading>
      </Container>
    )
  }
}

Subscription.propTypes = {
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      address: PropTypes.string.isRequired
    }).isRequired,
  }).isRequired,
  account: PropTypes.shape({
    web3: PropTypes.object,
    address: PropTypes.string.isRequired
  }).isRequired,
  query: PropTypes.shape({
    fetch: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    response: PropTypes.shape({
      owner: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
      paymentAmount: PropTypes.string.isRequired,
      paymentInterval: PropTypes.string.isRequired,
    }),
  }).isRequired,
  deleteSubscription: PropTypes.shape({
    saving: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
  }).isRequired,
}

export default compose(
  requireAccount,
  createQuery(api.tokenSubscription.getSubscription),
  createMutation(api.tokenSubscription.remove, { name: "deleteSubscription" }),
)(Subscription)
