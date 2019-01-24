import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Button} from 'semantic-ui-react'
import { compose } from '../../util'
import * as api from '../../api'
import withAccount from '../with-account'
import createMutation from '../create-mutation'

class ChargeSubscriberButton extends Component {
  onClick = async () => {
    const { response, error } = await this.props.mutation.save({
      web3: this.props.account.web3,
      subscriptionAddress: this.props.subscriptionAddress,
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
        color={this.props.canCharge ? "green" : "grey"}
        disabled={!this.props.canCharge || this.props.mutation.saving}
        onClick={this.onClick}
      >
        Charge
      </Button>
    )
  }
}

ChargeSubscriberButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  subscriptionAddress: PropTypes.string.isRequired,
  canCharge: PropTypes.bool.isRequired,
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
  withAccount,
  createMutation(api.tokenSubscription.charge)
)(ChargeSubscriberButton)
