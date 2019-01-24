import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Segment, Container, Menu, Button, Table} from 'semantic-ui-react'
import * as api from '../api'
import { compose } from '../util'
import requireAccount from './require-account'
import Loading from './loading'
import createQuery from './create-query'

// TODO list bounties (id, contract address, token address, amount)
class Bounties extends Component {
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
    })
  }

  onClickCreate = e => {
    e.preventDefault()
    this.props.history.push('/bounties/new')
  }

  onClickBounty = (e, id) => {
    e.preventDefault()
    this.props.history.push(`/bounties/${id}`)
  }

  onClickSubscription = (e, address) => {
    e.preventDefault()
    this.props.history.push(`/subscriptions/${address}`)
  }

  render() {
    const { query } = this.props
    const { response } = query

    return (
      <Container>
        <Menu secondary>
          <Menu.Item>
            <h3>Bounties</h3>
          </Menu.Item>

          <Menu.Item position="right">
            <Button
              type="submit"
              color="green"
              onClick={this.onClickCreate}
            >
              Create
            </Button>
          </Menu.Item>
        </Menu>
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
                    Id
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    Subscription
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    Amount
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {response.bounties.map((bounty, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <a
                        href="#"
                        onClick={e => this.onClickBounty(e, bounty.id)}
                      >
                        {bounty.id}
                      </a>
                    </Table.Cell>
                    <Table.Cell>
                      <a
                        href="#"
                        onClick={e => this.onClickSubscription(e, bounty.tokenSubscription)}
                      >
                        {bounty.tokenSubscription}
                      </a>
                    </Table.Cell>
                    <Table.Cell>
                      {bounty.amount}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Loading>
      </Container>
    )
  }
}

Bounties.propTypes = {
  account: PropTypes.shape({
    web3: PropTypes.object
  }).isRequired,
  requireAccount: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  query: PropTypes.shape({
    fetch: PropTypes.func.isRequired,
    fetchMore: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    // TODO
    response: PropTypes.shape({
      nonce: PropTypes.number.isRequired,
      bounties: PropTypes.arrayOf(PropTypes.shape({

      })).isRequired,
    }),
  }).isRequired
}

export default compose(
  requireAccount,
  createQuery(api.paymentBounty.getBounties)
)(Bounties)
