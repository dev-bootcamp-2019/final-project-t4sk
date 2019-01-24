var TestToken = artifacts.require("./TestToken.sol");

module.exports = function(deployer, network, accounts) {
  if (network == "development") {
    return deployer.then(async () => {
      const testToken = await TestToken.deployed()

      await testToken.mint(1000, { from: accounts[1] })
    })
  }
};
