import TruffleContract from 'truffle-contract'
import {
  ZERO_ADDRESS,
  batch,
  bigNumberResponseToStr
} from './util'

const TokenSubscription = TruffleContract(require('../contracts/TokenSubscription.json'))

// mutation
async function create(params) {
  const {
    web3,
    tokenAddress,
    paymentAmount,
    paymentInterval
  } = params

  TokenSubscription.setProvider(web3.currentProvider)

  // TODO pass big number?
  const res = await TokenSubscription.new(tokenAddress, paymentAmount, paymentInterval, {
    from: web3.eth.defaultAccount
  })

  return {
    address: res.address
  }
}

// TODO Error: The provider doesn't support subscriptions: HttpProvider
async function subscribe(params) {
  const {
    web3,
    subscriptionAddress,
  } = params

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(subscriptionAddress)

  await tokenSubscription.subscribe({
    from: web3.eth.defaultAccount
  })
}

async function unsubscribe(params) {
  const {
    web3,
    subscriptionAddress,
  } = params

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(subscriptionAddress)

  await tokenSubscription.unsubscribe({
    from: web3.eth.defaultAccount
  })
}

export async function remove(params) {
  const {
    web3,
    address,
  } = params

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(address)


  // TODO listen for events
  // TODO MetaMask - RPC Error: Internal JSON-RPC error
  await tokenSubscription.kill()
}

async function charge(params) {
  const {
    web3,
    subscriptionAddress,
    subscriberAddress,
  } = params

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(subscriptionAddress)

  // TODO listen for events
  await tokenSubscription.charge(subscriberAddress, {
    from: web3.eth.defaultAccount
  })
}

// query
async function getSubscription(params) {
  const {
    web3,
    address
  } = params

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSub = await TokenSubscription.at(address)

  return batch({
    owner: tokenSub.owner,
    token: tokenSub.token,
    paymentAmount: () => bigNumberResponseToStr(tokenSub.paymentAmount),
    paymentInterval: () => bigNumberResponseToStr(tokenSub.paymentInterval),
  })
}

async function getSubscriberByAddress(params) {
  const {
    web3,
    subscriptionAddress,
    address,
  } = params

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(subscriptionAddress)

  const isSubscribed = await tokenSubscription.isSubscribed(address)

  if (!isSubscribed) {
    return {
      isSubscribed: false,
    }
  }

  const id = await tokenSubscription.idOf(address)
  const subscriber = await tokenSubscription.subscribers(id)

  return {
    isSubscribed: true,
    startTimestamp: subscriber.startTimestamp.toString(),
    nextPaymentTimestamp: subscriber.nextPaymentTimestamp.toString(),
  }
}

async function getSubscriber(params) {
  const {
    tokenSubscription,
    id
  } = params

  const subscriber = await tokenSubscription.subscribers(id)
  const canCharge = await tokenSubscription.canCharge(subscriber.addr)

  return {
    id,
    address: subscriber.addr,
    canCharge,
    startTimestamp: subscriber.startTimestamp.toNumber(),
    nextPaymentTimestamp: subscriber.nextPaymentTimestamp.toNumber(),
  }
}

async function getSubscribers(params = {}) {
  const {
    web3,
    subscriptionAddress,
  } = params

  TokenSubscription.setProvider(web3.currentProvider)
  const tokenSubscription = await TokenSubscription.at(subscriptionAddress)

  const nonce = (await tokenSubscription.nonce()).toNumber()

  const subscribers = await Promise.all(
    [...Array(nonce).keys()]
    .map(i => i + 1)
    .map(id => getSubscriber({
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
  subscribe,
  unsubscribe,
  remove,
  charge,

  // query
  getSubscription,
  getSubscriberByAddress,
  getSubscribers,
}
