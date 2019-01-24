import React  from 'react'
import PropTypes from 'prop-types'
import RequireAccountModal from './require-account-modal'
import withAccount from './with-account'

export default function requireAccount(Component) {
  class RequireAccount extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        openModal: false,
      }
    }

    // TODO accept next action after unlockAccount
    requireAccount = () => {
      this.setState(state => ({
        openModal: true
      }))
    }

    onClickLogin = async () => {
      this.setState(state => ({
        openModal: false
      }))

      await this.props.unlockAccount()
    }

    onClose = () => {
      this.setState(state => ({
        openModal: false
      }))
    }

    render() {
      return (
        <div>
          <Component
            {...this.props}
            requireAccount={this.requireAccount}
          />
          <RequireAccountModal
            open={this.state.openModal}
            onClickLogin={this.onClickLogin}
            onClose={this.onClose}
          />
        </div>
      )
    }
  }

  RequireAccount.propTypes = {
    unlockAccount: PropTypes.func.isRequired,
  }

  return withAccount(RequireAccount)
}
