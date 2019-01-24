# Design Pattern Decisions

Fail Early and Fail Loud
========================
Functions that write to storage are extensively checked with `require` and `SafeMath`
is used for most arithmetic operations.

Restricting Access
==================
`TokenSubscription` contract can be deleted from the blockchain by calling
`TokenSubscription.kill`. Only the owner of the contract can execute this function.
Otherwise, subscriptions can be deleted and payments delayed if this function was unrestricted in access.

Only the owner of `TokenSubscription` can create a bounty in `PaymentBounty`.
When subscription is processed through the `PaymentBounty`, the bounty reward is
deducted from the `TokenSubscription` owner's account. If anyone could create a
bounty for any `TokenSubscription` contract, then there might be a situation where
the owner's token balance is deducted without his approval.

Mortal
======
`TokenSubscription` can be deleted, this is useful when creating a new
subscription contract and making sure that subscribers are not double-charged (from old and new contracts).

Pull over Push Payments
=======================
Push is used instead of pull for transfering tokens. Contracts are designed to avoid a honey pot and a black hole by not holding onto any tokens. In other words, the token is never transferred to the the contract for the users to withdraw. Instead tokens are sent directly from the subscriber to the subscription creator. Reentrancy attack is minimized by changing states before calling external contracts.

Circuit Breaker
===============
`TokenSubscription` implements a circuit breaker. When something goes wrong, the
owner of the contract can stop the contract.

`PaymentBounty` does not implement a circuit breaker. The critical part of `PaymentBounty` is in the processing of payments, and this can not execute if
`TokenSubscription` is paused.
