import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Container, Menu, Button, Table} from 'semantic-ui-react'
import moment from 'moment'
import * as api from '../../api'
import { compose } from '../../util'
import withAccount from '../with-account'
import createQuery from '../create-query'
import Loading from '../loading'
import ProcessPaymentButton from './process-payment-button'

// TODO real time can charge
class Subscribers extends Component {
  componentDidMount() {
    this.fetch()
  }

  fetch = () => {
    this.props.query.fetch({
      web3: this.props.account.web3,
      subscriptionAddress: this.props.subscriptionAddress,
    })
  }

  render() {
    const { query } = this.props
    const { response } = query

    return (
      <Loading
        loading={query.fetching}
        error={query.error}
        onRetry={this.fetch}
      >
        {response && (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  Address
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Start At
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Next Payment At
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Charge
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {response.subscribers.map((subscriber, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    {subscriber.address}
                  </Table.Cell>

                  <Table.Cell>
                    {moment.unix(subscriber.startTimestamp).format('YYYY-MM-DD-HH:mm:ss')}
                  </Table.Cell>

                  <Table.Cell>
                    {moment.unix(subscriber.nextPaymentTimestamp).format('YYYY-MM-DD-HH:mm:ss')}
                  </Table.Cell>

                  <Table.Cell>
                    <ProcessPaymentButton
                      onSuccess={this.fetch}
                      bountyId={this.props.bountyId}
                      {...subscriber}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Loading>
    )
  }
}

Subscribers.propTypes = {
  account: PropTypes.shape({
    web3: PropTypes.object.isRequired
  }).isRequired,
  bountyId: PropTypes.number.isRequired,
  subscriptionAddress: PropTypes.string.isRequired,
  query: PropTypes.shape({
    fetch: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    // TODO response proptypes
    response: PropTypes.shape({
    }),
  }).isRequired
}

export default compose(
  withAccount,
  createQuery(api.paymentBounty.getSubscribers)
)(Subscribers)
