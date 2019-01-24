import React  from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as account from '../reducer/account'
import * as api from '../api'

export default function withAccount(Component) {
  class WithAccount extends React.Component {
    unlockAccount = async () => {
      try {
        const res = await api.loadWeb3()

        if (!res) {
          return {}
        }

        const { web3, account } = res

        this.props.loadAccount({
          web3,
          address: account,
        })

        return {
          web3,
          address: account
        }
      } catch(error) {
        console.log(error)
      }
    }

    render() {
      return (
        <Component
          {...this.props}
          unlockAccount={this.unlockAccount}
          unloadAccount={this.props.unloadAccount}
        />
      )
    }
  }

  WithAccount.propTypes = {
    account: PropTypes.shape({
      web3: PropTypes.object,
      address: PropTypes.string.isRequired,
    }).isRequired,
    loadAccount: PropTypes.func.isRequired,
    unloadAccount: PropTypes.func.isRequired,
  }

  return connect(state => ({account: state.account}), {
    loadAccount: account.actions.load,
    unloadAccount: account.actions.unload,
  })(WithAccount)
}
