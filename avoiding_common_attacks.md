# Avoiding Common Attacks

Reentrancy
===========
Reentrancy attack is minimized by changing states before calling external contracts.

Interger Overflow and Underflow
===============================
By using `SafeMath` arithmetic overflow and underflow will reject the transaction.
