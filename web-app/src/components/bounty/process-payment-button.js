import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Button} from 'semantic-ui-react'
import { compose } from '../../util'
import * as api from '../../api'
import requireAccount from '../require-account'
import createMutation from '../create-mutation'

class ProcessPaymentButton extends Component {
  onClick = async () => {
    const { web3 } = this.props.account

    if (!web3) {
      this.props.requireAccount()
      return
    }

    const { response, error } = await this.props.mutation.save({
      web3,
      bountyId: this.props.bountyId,
      subscriberAddress: this.props.address,
    })

    if (!error) {
      this.props.onSuccess()
    } else {
      // TODO error handling
      console.error(error)
    }
  }

  render() {
    return (
      <Button
        size="mini"
        color={this.props.canProcessPayment ? "green" : "grey"}
        disabled={!this.props.canProcessPayment || this.props.mutation.saving}
        onClick={this.onClick}
      >
        Process Payment
      </Button>
    )
  }
}

ProcessPaymentButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  bountyId: PropTypes.number.isRequired,
  canProcessPayment: PropTypes.bool.isRequired,
  address: PropTypes.string.isRequired,
  account: PropTypes.shape({
    web3: PropTypes.object,
  }).isRequired,
  mutation: PropTypes.shape({
    saving: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
  }).isRequired,
}

export default compose(
  requireAccount,
  createMutation(api.paymentBounty.processPayment)
)(ProcessPaymentButton)
