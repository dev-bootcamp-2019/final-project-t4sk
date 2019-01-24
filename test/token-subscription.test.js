const chai = require("chai")
chai.use(require("chai-as-promised"))
chai.use(require('chai-bignumber')())

const expect = chai.expect

const {
  web3,
  ZERO_ADDRESS
} = require('./util')

const TestToken = artifacts.require('TestToken')
const TokenSubscription = artifacts.require('TokenSubscription')

// We test for functions that write to storage and check that validations done
// before the tests are working correctly. Most functions that read from the
// storage are used here, hence they are implicitly tested.

// We don't test or check if token balance changed after
// TokenSubscription.charge because there is no incentive to collect payments
// from a broken token.

contract('TokenSubscription', accounts => {
  let token
  let tokenSubscription

  const paymentAmount = 1
  const paymentInterval = 100

  const owner = accounts[0]
  const subscriber = accounts[1]

  beforeEach(async () => {
    token = await TestToken.new()
    tokenSubscription = await TokenSubscription.new(
      token.address,
      paymentAmount,
      paymentInterval
    )
  })

  describe('constructor', () => {
    it('should set params', async () => {
      const tokenSubscription = await TokenSubscription.new(
        token.address,
        paymentAmount,
        paymentInterval
      )

      assert.equal(
        await tokenSubscription.owner(),
        owner,
        'owner mismatch'
      )

      assert.equal(
        await tokenSubscription.isPauser(owner),
        true,
        'owner not pauser'
      )

      assert.equal(
        await tokenSubscription.token(),
        token.address,
        'token mismatch'
      )

      assert.equal(
        await tokenSubscription.paymentAmount(),
        paymentAmount,
        'paymentAmount mismatch'
      )

      assert.equal(
        await tokenSubscription.paymentInterval(),
        paymentInterval,
        'paymentInterval mismatch'
      )
    })

    it('should reject if token == address(0)', async () => {
      await expect(
        TokenSubscription.new(
          ZERO_ADDRESS,
          paymentAmount,
          paymentInterval
        )
      ).to.be.rejected
    })

    it('should reject if paymentAmount == 0', async () => {
      await expect(
        TokenSubscription.new(
          token.address,
          0,
          paymentInterval
        )
      ).to.be.rejected
    })

    it('should reject if paymentInterval == 0', async () => {
      await expect(
        TokenSubscription.new(
          token.address,
          paymentAmount,
          0
        )
      ).to.be.rejected
    })
  })

  describe('subscribe', () => {
    it('should subscribe', async () => {
      const tx  = await tokenSubscription.subscribe({
        from: subscriber
      })

      const { logs } = tx

      assert.equal(logs[0].event, 'Subscribed')
      assert.equal(logs[0].args.subscriberId, 1)
      assert.equal(logs[0].args.subscriber, subscriber)

      assert.equal(
        await tokenSubscription.isSubscribed(subscriber),
        true
      )

      const subscriberId = await tokenSubscription.idOf(subscriber);
      assert.equal(subscriberId, 1)

      const sub = await tokenSubscription.subscribers(subscriberId)
      const block = await web3.eth.getBlock(tx.receipt.blockNumber)

      assert.equal(sub.addr, subscriber)
      assert.equal(sub.startTimestamp, block.timestamp)
      assert.equal(sub.nextPaymentTimestamp, block.timestamp)
    })

    it('should reject if already subscribed', async () => {
      await tokenSubscription.subscribe({
        from: subscriber
      })

      await expect(tokenSubscription.subscribe({
        from: subscriber
      })).to.be.rejected
    })
  })

  describe('unsubscribe', () => {
    beforeEach(async () => {
      await tokenSubscription.subscribe({
        from: subscriber
      })
    })

    it('should unsubscribe', async () => {
      const tx  = await tokenSubscription.unsubscribe({
        from: subscriber
      })

      const { logs } = tx

      assert.equal(logs[0].event, 'Unsubscribed')
      assert.equal(logs[0].args.subscriberId, 1)
      assert.equal(logs[0].args.subscriber, subscriber)

      assert.equal(
        await tokenSubscription.isSubscribed(subscriber),
        false
      )

      const subscriberId = await tokenSubscription.idOf(subscriber);
      assert.equal(subscriberId, 0)

      const sub = await tokenSubscription.subscribers(1)

      assert.equal(sub.addr, ZERO_ADDRESS)
      assert.equal(sub.startTimestamp, 0)
      assert.equal(sub.nextPaymentTimestamp, 0)

      assert.equal(
        await tokenSubscription.canCharge(subscriber),
        false
      )
    })

    it('should reject if not subscribed', async () => {
      await tokenSubscription.unsubscribe({
        from: subscriber
      })

      await expect(tokenSubscription.unsubscribe({
        from: subscriber
      })).to.be.rejected
    })
  })

  describe('charge', () => {
    beforeEach(async () => {
      await tokenSubscription.subscribe({
        from: subscriber
      })

      await token.transfer(subscriber, 10)
      await token.approve(tokenSubscription.address, 10, {
        from: subscriber
      })
    })

    it('should charge', async () => {
      assert.equal(
        await tokenSubscription.canCharge(subscriber),
        true
      )

      const tx = await tokenSubscription.charge(subscriber)
      const { logs } = tx

      assert.equal(logs[0].event, 'Charged')
      assert.equal(logs[0].args.subscriberId, 1)
      assert.equal(logs[0].args.subscriber, subscriber)

      assert.equal(
        await tokenSubscription.canCharge(subscriber),
        false
      )

      const sub = await tokenSubscription.subscribers(1)
      const block = await web3.eth.getBlock(tx.receipt.blockNumber)

      expect(sub.nextPaymentTimestamp.toString()).to.be.bignumber.greaterThan(
        block.timestamp.toString()
      )

      expect(sub.nextPaymentTimestamp.toString()).to.be.bignumber.equal(
        sub.startTimestamp.add(
          web3.utils.toBN(paymentInterval)
        ).toString()
      )
    })

    it('should reject if not subscribed', async () => {
      await expect(tokenSubscription.charge(accounts[2])).to.be.rejected
    })

    it('should reject if block.timestamp < nextPaymentTimestamp', async () => {
      await tokenSubscription.charge(subscriber)
      await expect(tokenSubscription.charge(subscriber)).to.be.rejected
    })

    it('should reject if token allowance < charged paymentAmount', async () => {
      await token.approve(tokenSubscription.address, 0, {
        from: subscriber
      })

      await expect(tokenSubscription.charge(subscriber)).to.be.rejected
    })

    it('should reject if token balance of subscriber < charged paymentAmount', async () => {
      await token.transfer(accounts[0], 10, {
        from: subscriber
      })

      await expect(tokenSubscription.charge(subscriber)).to.be.rejected
    })
  })

  describe('kill', () => {
    it('should kill', async () => {
      await tokenSubscription.kill()
      await expect(tokenSubscription.owner()).to.be.rejected
    })

    it('should reject if not owner', async () => {
      await expect(tokenSubscription.kill({
        from: accounts[1]
      })).to.be.rejected
    })
  })
})
