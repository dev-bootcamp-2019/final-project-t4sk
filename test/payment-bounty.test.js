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
const PaymentBounty = artifacts.require('PaymentBounty')

// We test for functions that write to storage and check that validations done
// before the tests are working correctly. Most functions that read from the
// storage are used here, hence they are implicitly tested.

// We don't test or check if token balance changed after
// PaymentBounty.processPayment because there is no incentive to process payment
// for a broken token.

contract('PaymentBounty', accounts => {
  let paymentBounty
  let tokenSubscription

  const paymentAmount = 10
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

    paymentBounty = await PaymentBounty.new()
  })

  describe('create', () => {
    it('should create', async () => {
      const tx  = await paymentBounty.create(tokenSubscription.address, 1)

      const { logs } = tx

      assert.equal(logs[0].event, 'BountyCreated')
      assert.equal(logs[0].args.bountyId, 1)
      assert.equal(logs[0].args.tokenSubscription, tokenSubscription.address)

      assert.equal(
        await paymentBounty.isRegistered(tokenSubscription.address),
        true
      )

      const bountyId = await paymentBounty.idOf(tokenSubscription.address)
      assert.equal(bountyId, 1)

      const bounty = await paymentBounty.bounties(bountyId)

      assert.equal(
        bounty.tokenSubscription,
        tokenSubscription.address
      )
      assert.equal(
        bounty.amount,
        1
      )
    })

    it('should reject if already registered', async () => {
      await paymentBounty.create(tokenSubscription.address, 1)
      await expect(
        paymentBounty.create(tokenSubscription.address, 1)
      ).to.be.rejected
    })

    it('should reject if msg.sender is not the owner of TokenSubscription', async () => {
      await expect(
        paymentBounty.create(tokenSubscription.address, 1, {
          from: accounts[1]
        })
      ).to.be.rejected
    })

    it('should reject if amount == 0', async () => {
      await expect(
        paymentBounty.create(tokenSubscription.address, 0)
      ).to.be.rejected
    })

    it('should reject if bounty amount > TokenSubscription paymentAmount', async () => {
      await expect(
        paymentBounty.create(tokenSubscription.address, 11)
      ).to.be.rejected
    })
  })

  describe('remove', () => {
    beforeEach(async () => {
      await paymentBounty.create(tokenSubscription.address, 1)
    })

    it('should remove', async () => {
      const tx = await paymentBounty.remove(1)

      const { logs } = tx

      assert.equal(logs[0].event, 'BountyRemoved')
      assert.equal(logs[0].args.bountyId, 1)

      assert.equal(
        await paymentBounty.isRegistered(tokenSubscription.address),
        false
      )

      const bountyId = await paymentBounty.idOf(tokenSubscription.address)
      assert.equal(bountyId, 0)

      const bounty = await paymentBounty.bounties(1)

      assert.equal(
        bounty.tokenSubscription,
        ZERO_ADDRESS
      )
      assert.equal(
        bounty.amount,
        0
      )
    })

    it('should reject if msg.sender is not the owner of bounty', async () => {
      await expect(paymentBounty.remove(1, {
        from: accounts[1]
      })).to.be.rejected
    })

    it('should reject if bounty does not exist', async () => [
      await expect(paymentBounty.remove(0)).to.be.rejected
    ])
  })

  describe('processPayment', () => {
    const bountyId = 1

    beforeEach(async () => {
      await paymentBounty.create(tokenSubscription.address, 1)
      await token.approve(paymentBounty.address, 10)

      await token.transfer(subscriber, 10)
      await tokenSubscription.subscribe({
        from: subscriber
      })
      await token.approve(tokenSubscription.address, 10, {
        from: subscriber
      })
    })

    it('should process payment', async () => {
      const tx = await paymentBounty.processPayment(bountyId, subscriber, {
        from: accounts[2]
      })

      const { logs } = tx

      assert.equal(logs[0].event, 'PaymentProcessed')
      assert.equal(logs[0].args.bountyId, 1)
      assert.equal(logs[0].args.subscriber, subscriber)
    })

    it('should reject if not bounty does not exist', async () => {
      await expect(paymentBounty.processPayment(0, subscriber)).to.be.rejected
    })

    it('should reject if allowance < bounty amount', async () => {
      await token.approve(paymentBounty.address, 0)
      await expect(paymentBounty.processPayment(bountyId, subscriber)).to.be.rejected
    })
  })
})
