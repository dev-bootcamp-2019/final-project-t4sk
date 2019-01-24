import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Menu, Button, Table, Message} from 'semantic-ui-react'
import moment from 'moment'
import { compose } from '../../util'
import * as api from '../../api'
import withAccount from '../with-account'
import createQuery from '../create-query'
import createMutation from '../create-mutation'
import Loading from '../loading'
import TokenApproval from '../token-approval'

class Subscriber extends Component {
  componentDidMount() {
    this.fetch()
  }

  fetch = () => {
    this.props.query.fetch({
      web3: this.props.account.web3,
      subscriptionAddress: this.props.subscriptionAddress,
      address: this.props.account.address,
    })
  }

  subscribe = async () => {
    await this.props.subscribe.save({
      web3: this.props.account.web3,
      subscriptionAddress: this.props.subscriptionAddress,
    })

    // fetch new state
    this.fetch()
  }

  unsubscribe = async () => {
    await this.props.unsubscribe.save({
      web3: this.props.account.web3,
      subscriptionAddress: this.props.subscriptionAddress,
    })

    // fetch new state
    this.fetch()
  }

  render() {
    const { query } = this.props
    const { response } = query

    return (
      <div>
        <Loading
          loading={!response && query.fetching}
          error={!response && query.error}
          onRetry={this.fetch}
        >
          <React.Fragment>
            <Menu secondary>
              {response && response.isSubscribed && (
                <Menu.Item>
                  <h5>Subscription Detail</h5>
                </Menu.Item>
              )}
              <Menu.Item position="right">
                {response && response.isSubscribed ? (
                  <Button
                    color="red"
                    inverted
                    disabled={this.props.unsubscribe.saving}
                    onClick={this.unsubscribe}
                  >
                    Unsubscribe
                  </Button>
                ) : (
                  <Button
                    color="green"
                    disabled={this.props.subscribe.saving}
                    onClick={this.subscribe}
                  >
                    Subscribe
                  </Button>
                )}
              </Menu.Item>
            </Menu>

            {this.props.subscribe.error && (
              <Message negative>
                <p>{`${this.props.subscribe.error}`}</p>
              </Message>
            )}

            {this.props.unsubscribe.error && (
              <Message negative>
                <p>{`${this.props.unsubscribe.error}`}</p>
              </Message>
            )}

            {response && response.isSubscribed && (
              <Table>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>
                      Next Payment At
                    </Table.Cell>
                    <Table.Cell>
                      {moment.unix(response.nextPaymentTimestamp).format("YYYY-MM-DD HH:mm")}
                    </Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell>
                      Subscribed At
                    </Table.Cell>
                    <Table.Cell>
                      {moment.unix(response.startTimestamp).format("YYYY-MM-DD HH:mm")}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            )}

            {response && response.isSubscribed && (
              <React.Fragment>
                <Menu secondary>
                  <Menu.Item>
                    <h5>Token</h5>
                  </Menu.Item>
                </Menu>
                <TokenApproval
                  spenderAddress={this.props.subscriptionAddress}
                  tokenAddress={this.props.tokenAddress}
                  onUpdate={() => {}}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        </Loading>
      </div>
    )
  }
}

Subscriber.propTypes = {
  subscriptionAddress: PropTypes.string.isRequired,
  tokenAddress: PropTypes.string.isRequired,
  account: PropTypes.shape({
    web3: PropTypes.object.isRequired,
    address: PropTypes.string.isRequired,
  }).isRequired,
  query: PropTypes.shape({
    fetch: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    response: PropTypes.shape({
    }),
  }),
  subscribe: PropTypes.shape({
    saving: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
  }).isRequired,
  unsubscribe: PropTypes.shape({
    saving: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
  }).isRequired,
}

export default compose(
  withAccount,
  createQuery(api.tokenSubscription.getSubscriberByAddress),
  createMutation(api.tokenSubscription.subscribe, { name: 'subscribe' }),
  createMutation(api.tokenSubscription.unsubscribe, { name: 'unsubscribe' }),
)(Subscriber)
