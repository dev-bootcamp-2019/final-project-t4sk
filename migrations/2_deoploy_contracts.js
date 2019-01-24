var PaymentBounty = artifacts.require("./PaymentBounty.sol");

module.exports = function(deployer) {
  deployer.deploy(PaymentBounty);
};
