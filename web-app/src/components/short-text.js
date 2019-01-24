import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ShortText extends Component {
  render() {
    return (
      <div style={{
        width: this.props.width,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {this.props.children}
      </div>
    )
  }
}

ShortText.propTypes = {
  width: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
}

ShortText.defaultProps = {
  width: 150
}

export default ShortText
