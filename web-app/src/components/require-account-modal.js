import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Image } from 'semantic-ui-react'
import metaMaskImg from '../meta-mask.png'

class RequireAccountModal extends Component {
  render() {
    return (
      <Modal
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <Modal.Header>Account Required</Modal.Header>
        <Modal.Content image>
          <Image wrapped size='tiny' src={metaMaskImg} />
          <Modal.Description>
            <p>Please log into MetaMask to continue</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color='green'
            onClick={this.props.onClickLogin}
          >
            Login
          </Button>
          <Button onClick={this.props.onClose}>
            Close
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

RequireAccountModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClickLogin: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default RequireAccountModal
