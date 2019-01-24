import TruffleContract from 'truffle-contract'
import {
  bigNumberResponseToStr,
  batch,
} from './util'

const ERC20 = TruffleContract(require('../contracts/ERC20.json'))

async function getTokenHolderInfo(params) {
  const {
    web3,
    tokenAddress,
    spenderAddress,
  } = params

  const account = web3.eth.defaultAccount

  ERC20.setProvider(web3.currentProvider)
  const token = await ERC20.at(tokenAddress)

  return batch({
    balance: () => bigNumberResponseToStr(
      () => token.balanceOf(account)
    ),
    allowance: () => bigNumberResponseToStr(
      () => token.allowance(account, spenderAddress)
    ),
  })
}

async function approve(params) {
  const {
    web3,
    tokenAddress,
    spenderAddress,
    amount
  } = params

  const account = web3.eth.defaultAccount

  ERC20.setProvider(web3.currentProvider)
  const token = await ERC20.at(tokenAddress)

  // TODO watch for events
  const res = await token.approve(spenderAddress, amount, {
    from: account,
  })

  return res
}

export default {
  // query
  getTokenHolderInfo,
  //mutation
  approve
}
