- [x] A project README.md that explains your project
  - [x] What does your project do?
  - [x] How to set it up
      - [x] Run a local development server

- [x] Your project should be a truffle project
  - [x] All of your contracts should be in a contracts directory
    - [x] Truffle compile should successfully compile contracts
  - [x] Migration contract and migration scripts should work
    - [x] Truffle migrate should successfully migrate contracts to a locally running ganache-cli test blockchain on port 8545
  - [x] All tests should be in a test directory
    - [x] Running truffle test should migrate contracts and run your tests

- [x] Smart Contract code should be commented according to the [specs in the documentation](https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments)

- [x] Create at least 5 tests for each smart contract
  - [x] Write a sentence or two explaining what the tests are covering, and explain why you wrote those tests

- [x] A development server to serve the front end interface of the application
  - [x] It can be something as simple as the lite-server used in the truffle pet shop tutorial

- [x] A document called design_pattern_desicions.md that explains why you chose to use the design patterns that you did.

- [x] A document called avoiding_common_attacks.md that explains what measures you took to ensure that your contracts are not susceptible to common attacks. (Module 9 Lesson 3)

- [x] Implement/ use a library or an EthPM package in your project
  - [x] If your project does not require a library or an EthPM package, demonstrate how you would do that in a contract called LibraryDemo.sol

### Requirements
- [x] User Interface Requirements:
  - [x] Run the app on a dev server locally for testing/grading
  - [x] You should be able to visit a URL and interact with the application
    - [x] App recognizes current account
    - [x] Sign transactions using MetaMask or uPort
    - [x] Contract state is updated
    - [x] Update reflected in UI

- [x] Test Requirements:
  - [x]  Write 5 tests for each contract you wrote
    - [x]  Solidity or JavaScript
  - [x]  Explain why you wrote those tests
  - [x]  Tests run with truffle test

- [x] Design Pattern Requirements:
  - [x] Implement a circuit breaker (emergency stop) pattern
  - [x] What other design patterns have you used / not used?
    - [x] Why did you choose the patterns that you did?
    - [x] Why not others?

- [x] Security Tools / Common Attacks:
  - [x] Explain what measures you’ve taken to ensure that your contracts are not susceptible to common attacks

- [x] Use a library or extend a contract
  - [x] Via EthPM or write your own

- [x] Deploy your application onto one of the test networks. Include a document called deployed_addresses.txt that describes where your contracts live (which testnet and address).

- [x] Students can verify their source code using etherscan for the appropriate testnet https://etherscan.io/verifyContract
- [x] Evaluators can check by getting the provided contract ABI and calling a function on the deployed contract at https://www.myetherwallet.com/#contracts or checking the verification on etherscan

- [ ] Stretch requirements (for bonus points, not required):
    - [ ] Implement an upgradable design pattern
    - [ ] Write a smart contract in LLL or Vyper
  - [ ] Integrate with an additional service, maybe even one we did not cover in this class

  For example:
  - [ ] IPFS
    Users can dynamically upload documents to IPFS that are referenced via their smart contract
  - [ ] uPort
  - [ ] Ethereum Name Service
    A name registered on the ENS resolves to the contract, verifiable on rinkeby.etherscan.io/contract_name
  - [ ] Oracle
