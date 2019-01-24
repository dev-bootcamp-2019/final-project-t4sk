import TruffleContract from 'truffle-contract'
import { ZERO_ADDRESS, batch } from './util'

const PaymentBounty = TruffleContract(require('../contracts/PaymentBounty.json'))
const TokenSubscription = TruffleContract(require('../contracts/TokenSubscription.json'))
const ERC20 = TruffleContract(require('../contracts/ERC20.json'))

// mutation
async function create(params) {
  const {
    web3,
    subscriptionAddress,
    bountyAmount
  } = params

  PaymentBounty.setProvider(web3.currentProvider)

  const paymentBounty = await PaymentBounty.deployed()

  // TODO Error: The provider doesn't support subscriptions: HttpProvider
  await paymentBounty.create(subscriptionAddress, bountyAmount, {
    from: web3.eth.defaultAccount,
  })
}

async function processPayment(params) {
  const {
    web3,
    bountyId,
    subscriberAddress
  } = params

  PaymentBounty.setProvider(web3.currentProvider)

  const paymentBounty = await PaymentBounty.deployed()

  const res = await paymentBounty.processPayment(bountyId, subscriberAddress, {
    from: web3.eth.defaultAccount,
  })

  // TODO listen for events? how to handle res
  return res
}

// query
async function getBounty(params) {
  const {
    web3,
    id,
  } = params

  PaymentBounty.setProvider(web3.currentProvider)
  const paymentBounty = await PaymentBounty.deployed()

  const bounty = await paymentBounty.bounties(id)

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(bounty.tokenSubscription)

  const token = await tokenSubscription.token()
  const owner = await tokenSubscription.owner()

  ERC20.setProvider(web3.currentProvider)
  const erc20 = await ERC20.at(token)

  const balance = (await erc20.balanceOf(owner)).toString()
  const allowance = (await erc20.allowance(owner, paymentBounty.address)).toString()

  return {
    paymentBountyAddress: paymentBounty.address,
    id,
    tokenSubscription: bounty.tokenSubscription,
    amount: bounty.amount.toString(),
    token,
    owner,
    balance,
    allowance,
  }
}

async function _getBounty(params) {
  const {
    paymentBounty,
    id,
  } = params

  const bounty = await paymentBounty.bounties(id)

  return {
    id,
    tokenSubscription: bounty.tokenSubscription,
    amount: bounty.amount.toString(),
  }
}

async function getBounties(params = {}) {
  const {
    web3,
  } = params

  PaymentBounty.setProvider(web3.currentProvider)
  const paymentBounty = await PaymentBounty.deployed()

  // get nonce from bounty contract
  const nonce = (await paymentBounty.nonce()).toNumber()

  const bounties = await Promise.all(
    [...Array(nonce).keys()]
    .map(i => i + 1)
    .map(id => _getBounty({
      paymentBounty,
      id
    }))
    .filter(bounty => bounty.tokenSubscription != ZERO_ADDRESS)
  )

  return {
    nonce,
    bounties
  }
}

async function getSubscriber(params) {
  const {
    paymentBounty,
    tokenSubscription,
    id
  } = params

  const subscriber = await tokenSubscription.subscribers(id)
  const canProcessPayment = await paymentBounty.canProcessPayment(
    id, subscriber.addr
  )

  return {
    id,
    address: subscriber.addr,
    canProcessPayment,
    startTimestamp: subscriber.startTimestamp.toNumber(),
    nextPaymentTimestamp: subscriber.nextPaymentTimestamp.toNumber(),
  }
}

async function getSubscribers(params = {}) {
  const {
    web3,
    subscriptionAddress,
  } = params

  PaymentBounty.setProvider(web3.currentProvider)
  const paymentBounty = await PaymentBounty.deployed()

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(subscriptionAddress)

  const nonce = (await tokenSubscription.nonce()).toNumber()

  const subscribers = await Promise.all(
    [...Array(nonce).keys()]
    .map(i => i + 1)
    .map(id => getSubscriber({
      paymentBounty,
      tokenSubscription,
      id
    }))
    .filter(sub => sub.address != ZERO_ADDRESS)
  )

  return {
    nonce,
    subscribers,
  }
}


export default {
  // mutation
  create,
  processPayment,
  // query
  getBounty,
  getBounties,
  getSubscribers,
}
