import React from 'react'

export default function createQuery(request, opts = {}) {
  let _cache = {}

  function getCacheKey(params) {
    return JSON.stringify(params)
  }

  function getCache(params) {
    return _cache[getCacheKey(params)]
  }

  function saveCache(params, res) {
    // _cache[getCacheKey(params)] = res
  }

  const {
    fetching = true
  } = opts

  return Component => class extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        fetching: fetching,
        error: "",
        response: undefined
      }
    }

    fetch = async params => {
      // const cache = getCache(params)
      //
      // if (cache) {
      //   this.setState(state => ({
      //     fetching: false,
      //     error: "",
      //     response: cache
      //   }))
      //
      //   return
      // }

      this.setState(state => ({
        fetching: true,
        error: "",
      }))

      try {
        const response = await request(params)

        saveCache(params, response)

        this.setState(state => ({
          fetching: false,
          response,
        }))
      } catch (error) {
        this.setState(state => ({
          fetching: false,
          error: `${error}`
        }))
      }
    }

    fetchMore = async (params, opts) => {
      const {
        updateResponse = (prevRes, res) => res,
        updateCache = (save, params, res) => save(params, res)
      } = opts

      this.setState(state => ({
        fetching: true,
        error: "",
      }))

      try {
        const response = await request(params)

        this.setState(state => {
          const res = updateResponse(state.response, response)

          updateCache(saveCache, params, res)

          return {
            fetching: false,
            response: res
          }
        })
      } catch (error) {
        this.setState(state => ({
          fetching: false,
          error: `${error}`
        }))
      }
    }

    render() {
      return (
        <Component
          {...this.props}
          query={{
            ...this.state,
            fetch: this.fetch,
            fetchMore: this.fetchMore,
          }}
        />
      )
    }
  }
}
