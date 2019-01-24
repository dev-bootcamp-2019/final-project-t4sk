import Web3 from 'web3'

export { default as tokenSubscription } from './token-subscription'
export { default as erc20 } from './erc20'
export { default as paymentBounty } from './payment-bounty'

export async function loadWeb3() {
  if (!window.ethereum) {
    return
  }

  const web3 = new Web3(window.ethereum);
  const accounts = await window.ethereum.enable()

  web3.eth.defaultAccount = accounts[0]

  return {
    web3,
    account: accounts[0]
  }
}
