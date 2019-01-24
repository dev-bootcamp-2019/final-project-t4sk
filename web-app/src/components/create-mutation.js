import React  from 'react'
import PropTypes from 'prop-types'

export default function createMutation(request, opts = {}) {
  const {
    name = "mutation"
  } = opts

  return Component => class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        saving: false,
        error: "",
        response: undefined
      }
    }

    save = async params => {
      this.setState(state => ({
        saving: true,
        error: "",
      }))

      try {
        const response = await request(params)

        this.setState(state => ({
          saving: false,
          response,
        }))

        return { response }
      } catch (error) {
        this.setState(state => ({
          saving: false,
          error: `${error}`
        }))

        return { error }
      }
    }

    render() {
      return (
        <Component
          {...this.props}
          {...{
            [name]: {
              ...this.state,
              save: this.save,
            }
          }}
        />
      )
    }
  }
}
