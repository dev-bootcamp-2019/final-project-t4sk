const LOAD = "ACCOUNT/LOAD"
const UNLOAD = "ACCOUNT/UNLOAD"

const initialState = {
  web3: undefined,
  address: '',
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        web3: action.web3,
        address: action.address,
      }
    case UNLOAD:
      return initialState
    default:
      return state
  }
}

export const actions = {
  load({ web3, address }) {
    return {
      type: LOAD,
      web3,
      address,
    }
  },
  unload() {
    return {
      type: UNLOAD
    }
  }
}
