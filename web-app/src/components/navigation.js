import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Menu, Form, Input, Button, Icon, Dropdown} from 'semantic-ui-react'
import { withRouter } from 'react-router'
import withAccount from './with-account'
import { compose } from '../util'

class Navigation extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: ""
    }
  }

  onChange = (e, { value }) => {
    this.setState(state => ({
      ...state,
      address: value
    }))
  }

  onSubmit = () => {
    const address = this.state.address.trim()

    if (!!address) {
      this.props.history.push(`/subscriptions/${address}`)
    }
  }

  onClick = (e, { name }) => {
    this.props.history.push(name)
  }

  onLogOut = () => {
    this.props.history.replace('/')
    this.props.unloadAccount()
  }

  render() {
    return (
      <Menu>
        <Menu.Menu position='left'>
          <Menu.Item
            name='/'
            onClick={this.onClick}
          >
            Demonetize
          </Menu.Item>
        </Menu.Menu>

        <Menu.Menu position='right'>
          <Menu.Item>
            <Form onSubmit={this.onSubmit}>
              <Input
                className='icon'
                icon='search'
                iconPosition="left"
                placeholder='Find contract'
                onChange={this.onChange}
                value={this.state.address}
              />
            </Form>
          </Menu.Item>

          <Menu.Item
            name="/subscriptions/new"
            onClick={this.onClick}
          >
            Create Contract
          </Menu.Item>

          <Menu.Item
            name="/bounties"
            onClick={this.onClick}
          >
            Explore Bounties
          </Menu.Item>

          {this.props.account.address ? (
            <Dropdown item icon="user">
              <Dropdown.Menu>
                <Dropdown.Item>Account: {this.props.account.address}</Dropdown.Item>
                <Dropdown.Item onClick={this.onLogOut}>
                  Log out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Menu.Item
              onClick={this.props.unlockAccount}
            >
              Log In
            </Menu.Item>
          )}
        </Menu.Menu>
      </Menu>
    )
  }
}

Navigation.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  account: PropTypes.shape({
    address: PropTypes.string.isRequired,
  }).isRequired,
  unlockAccount: PropTypes.func.isRequired,
  unloadAccount: PropTypes.func.isRequired,
}

export default compose(
  withRouter,
  withAccount,
)(Navigation)
