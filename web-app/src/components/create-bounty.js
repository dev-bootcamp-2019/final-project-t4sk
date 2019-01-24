import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Form, Message, Button} from 'semantic-ui-react'
import * as api from '../api'
import { compose } from '../util'
import requireAccount from './require-account'
import createMutation from './create-mutation'

class CreateBounty extends Component {
  constructor(props) {
    super(props)

    this.state = {
      subscriptionAddress: "",
      bountyAmount: "",
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

    const { error } = await this.props.mutation.save({
      web3,
      ...this.state
    })

    if (!error) {
      // TODO redirect to /bounties/id
      this.props.history.replace(`/bounties`)
    }
  }

  render() {
    const { mutation } = this.props

    return (
      <Form
        onSubmit={this.onSubmit}
        error={!!mutation.error}
      >
        <h3>New Bounty</h3>

        <Message
          error={true}
          header={"Error"}
          content={mutation.error}
        />

        <Form.Field required>
          <label>Subscription Contract Address</label>
          <Form.Input
            name="subscriptionAddress"
            value={this.state.subscriptionAddress}
            onChange={this.onChange}
          />
        </Form.Field>

        <Form.Field required>
          <label>Bounty Amount</label>
          <Form.Input
            name="bountyAmount"
            value={this.state.bountyAmount}
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

CreateBounty.propTypes = {
  account: PropTypes.shape({
    web3: PropTypes.object,
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
  createMutation(api.paymentBounty.create)
)(CreateBounty)
