import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Message, Button} from 'semantic-ui-react'

class Loading extends Component {
  render() {
    if (this.props.loading) {
      return this.props.renderLoading()
    }

    if (this.props.error) {
      return (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{`${this.props.error}`}</p>
          <Button onClick={this.props.onRetry}>
            Retry
          </Button>
        </Message>
      )
    }

    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    )
  }
}

Loading.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.any,
  children: PropTypes.node,
  onRetry: PropTypes.func.isRequired,
  renderLoading: PropTypes.func.isRequired,
}

Loading.defaultProps = {
  renderLoading: () => <div>Loading...</div>
}

export default Loading
