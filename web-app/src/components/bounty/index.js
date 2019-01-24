import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Container, Menu, Button, Table} from 'semantic-ui-react'
import * as api from '../../api'
import { compose } from '../../util'
import requireAccount from '../require-account'
import createQuery from '../create-query'
import Loading from '../loading'
import TokenApproval from '../token-approval'
import Subscribers from './subscribers'

// TODO unregister if owner

class Bounty extends Component {
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
      id: this.props.match.params.bountyId
    })
  }

  onClickSubscription = (e, address) => {
    e.preventDefault()
    this.props.history.push(`/subscriptions/${address}`)
  }

  isOwner() {
    const { account, query: { response } } = this.props
    return (
      response &&
      response.owner.toLowerCase() == account.address.toLowerCase()
    )
  }

  render() {
    const { bountyId } = this.props.match.params
    const { query } = this.props
    const { response } = query

    return (
      <Container>
        <Menu secondary>
          <Menu.Item>
            <h3>Bounty {bountyId}</h3>
          </Menu.Item>
        </Menu>

        <Loading
          loading={query.fetching}
          error={query.error}
          onRetry={this.fetch}
        >
          {response && (
            <Table>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    Subsription
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href="#"
                      onClick={e => this.onClickSubscription(e, response.tokenSubscription)}
                    >
                      {response.tokenSubscription}
                    </a>
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
                    Bounty Amount
                  </Table.Cell>
                  <Table.Cell>
                    {response.amount}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          )}
        </Loading>

        {response && this.isOwner() && (
          <React.Fragment>
            <Menu secondary>
              <Menu.Item>
                <h5>Token Approval</h5>
              </Menu.Item>
            </Menu>
            <TokenApproval
              spenderAddress={response.paymentBountyAddress}
              tokenAddress={response.token}
              onUpdate={this.fetch}
            />
          </React.Fragment>
        )}

        <Menu secondary>
          <Menu.Item>
            <h5>Subscribers</h5>
          </Menu.Item>
        </Menu>
        {response && (
          <Subscribers
            bountyId={parseInt(bountyId)}
            subscriptionAddress={response.tokenSubscription}
          />
        )}
      </Container>
    )
  }
}

Bounty.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      bountyId: PropTypes.string.isRequired
    }).isRequired,
  }).isRequired,
  account: PropTypes.shape({
    address: PropTypes.string.isRequired
  }).isRequired,
  requireAccount: PropTypes.func.isRequired,
  query: PropTypes.shape({
    fetch: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    response: PropTypes.shape({
      // TODO
    }),
  }).isRequired
}

export default compose(
  requireAccount,
  createQuery(api.paymentBounty.getBounty)
)(Bounty)
