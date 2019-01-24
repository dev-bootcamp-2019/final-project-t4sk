import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Form, Button, Message} from 'semantic-ui-react'
import { compose } from '../util'
import * as api from '../api'
import withAccount from './with-account'
import createMutation from './create-mutation'

class TokenApprovalForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      amount: "",
    }
  }

  onChange = (e, { name, value }) => {
    this.setState(state => ({
      ...state,
      [name]: value
    }))
  }

  onSubmit = async () => {
    const { response, error } = await this.props.mutation.save({
      web3: this.props.account.web3,
      ...this.state,
      spenderAddress: this.props.spenderAddress,
      tokenAddress: this.props.tokenAddress,
    })

    if (!error) {
      this.props.onSuccess()
    }
  }

  render() {
    const { mutation } = this.props

    return (
      <Form
        onSubmit={this.onSubmit}
        error={!!mutation.error}
      >
        <Form.Group inline>
          <Form.Field>
            <Form.Input
              name="amount"
              placeholder="Amount"
              value={this.state.amount}
              onChange={this.onChange}
            />
          </Form.Field>

          <Button
            type="submit"
            color="green"
            disabled={mutation.saving}
          >
            Approve
          </Button>
        </Form.Group>

        <Message
          error={true}
          header={"Error"}
          content={mutation.error}
        />
      </Form>
    )
  }
}

TokenApprovalForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  spenderAddress: PropTypes.string.isRequired,
  tokenAddress: PropTypes.string.isRequired,
  account: PropTypes.shape({
    web3: PropTypes.object.isRequired,
  }).isRequired,
  mutation: PropTypes.shape({
    saving: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
  }).isRequired,
}

export default compose(
  withAccount,
  createMutation(api.erc20.approve)
)(TokenApprovalForm)
