import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Menu, Table} from 'semantic-ui-react'
import { compose } from '../util'
import * as api from '../api'
import withAccount from './with-account'
import createQuery from './create-query'
import Loading from './loading'
import TokenApprovalForm from './token-approval-form'

class TokenApproval extends Component {
  componentDidMount() {
    this.fetch()
  }

  fetch = () => {
    this.props.query.fetch({
      web3: this.props.account.web3,
      spenderAddress: this.props.spenderAddress,
      tokenAddress: this.props.tokenAddress,
    })
  }

  onSuccess = async () => {
    await this.fetch()
    this.props.onUpdate()
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
          <React.Fragment>
            <Table>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    Balance
                  </Table.Cell>
                  <Table.Cell>
                    {response.balance}
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    Approved
                  </Table.Cell>
                  <Table.Cell>
                    {response.allowance}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
            <TokenApprovalForm
              spenderAddress={this.props.spenderAddress}
              tokenAddress={this.props.tokenAddress}
              onSuccess={this.onSuccess}
            />
          </React.Fragment>
        )}
      </Loading>
    )
  }
}

TokenApproval.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  account: PropTypes.shape({
    web3: PropTypes.object.isRequired,
  }).isRequired,
  spenderAddress: PropTypes.string.isRequired,
  tokenAddress: PropTypes.string.isRequired,
  query: PropTypes.shape({
    fetch: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    response: PropTypes.shape({
    }),
  }).isRequired,
}

export default compose(
  withAccount,
  createQuery(api.erc20.getTokenHolderInfo)
)(TokenApproval)
