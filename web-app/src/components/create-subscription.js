import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Form, Button, Message} from 'semantic-ui-react'
import * as api from '../api'
import { compose } from '../util'
import createMutation from './create-mutation'
import requireAccount from './require-account'

class CreateSubscription extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tokenAddress: "",
      paymentInterval: "",
      paymentAmount: "",
    }
  }

  onChange = (e, { name, value }) => {
    this.setState(state => ({
      ...state,
      [name]: value
    }))
  }

  onSubmit = async () => {
    const { web3 } = this.props.account

    if (!web3) {
      this.props.requireAccount()
      return
    }

    const { response, error } = await this.props.mutation.save({
      web3,
      ...this.state
    })

    if (!error) {
      this.props.history.replace(`/subscriptions/${response.address}`)
    }
  }

  render() {
    const { mutation } = this.props

    return (
      <Form
        onSubmit={this.onSubmit}
        error={!!mutation.error}
      >
        <h3>New Subscription</h3>

        <Message
          error={true}
          header={"Error"}
          content={mutation.error}
        />

        <Form.Field required>
          <label>ERC20 Token Address</label>
          <Form.Input
            name="tokenAddress"
            value={this.state.tokenAddress}
            onChange={this.onChange}
          />
        </Form.Field>

        <Form.Field required>
          <label>Payment Interval (seconds)</label>
          <Form.Input
            name="paymentInterval"
            value={this.state.paymentInterval}
            onChange={this.onChange}
          />
        </Form.Field>

        <Form.Field required>
          <label>Payment Amount</label>
          <Form.Input
            name="paymentAmount"
            value={this.state.paymentAmount}
            onChange={this.onChange}
          />
        </Form.Field>

        <Button
          type="submit"
          color="green"
          disabled={mutation.saving}
        >
          Create
        </Button>
      </Form>
    )
  }
}

CreateSubscription.propTypes = {
  account: PropTypes.shape({
    web3: PropTypes.object
  }).isRequired,
  mutation: PropTypes.shape({
    saving: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired
}

export default compose(
  requireAccount,
  createMutation(api.tokenSubscription.create),
)(CreateSubscription)
