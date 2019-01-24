pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './TokenSubscription.sol';

contract PaymentBounty {
    using SafeMath for uint;

    event BountyCreated(uint indexed bountyId, address indexed tokenSubscription);
    event BountyRemoved(uint indexed bountyId);
    event PaymentProcessed(uint indexed bountyId, address indexed subscriber);

    struct Bounty {
        address tokenSubscription;
        uint amount;
    }

    /**
    * @dev nonce to keep track of latest bounty id
    */
    uint public nonce;
    mapping(address => uint) public idOf;
    // TODO iterable map for bounties ?
    mapping(uint => Bounty) public bounties;

    /**
    * @dev Function to check if an address of TokenSubscription is registered or not.
    * @param addr The address of TokenSubscription to check if registered.
    * @return A boolean indicating if the address is registered.
    */
    function isRegistered(address addr) public view returns (bool) {
        return idOf[addr] != 0;
    }

    /**
    * @dev Function to create a bounty.
    * @param addr The address of TokenSubscription
    * @param amount The amount of bounty
    * @return A boolean indicating if the address is registered.
    */
    function create(address addr, uint amount) public {
        require(
            !isRegistered(addr),
            "Address of TokenSubscription is already registered"
        );

        TokenSubscription tokenSubscription = TokenSubscription(addr);

        require(
            msg.sender == tokenSubscription.owner(),
            "Only owner can create a bounty"
        );

        require(amount > 0, "Amount must be > 0");
        require(
            amount <= tokenSubscription.paymentAmount(),
            "Amount must be <= tokenSubscription.amount"
        );

        nonce = nonce.add(1);

        idOf[addr] = nonce;
        bounties[nonce] = Bounty({
            tokenSubscription: addr,
            amount: amount
        });

        emit BountyCreated(nonce, addr);
    }

    /**
    * @dev Function to check if a bounty exists.
    * @param id The id of the bounty
    * @return A boolean indicating if the bounty exists.
    */
    function bountyExists(uint id) public view returns (bool) {
        return bounties[id].tokenSubscription != address(0);
    }

    /**
    * @dev Function to remove a bounty.
    * @param bountyId The id of the bounty to remove.
    */
    // TODO how to remove bounty if TokenSubscription is deleted
    function remove(uint bountyId) public {
        require(bountyExists(bountyId), "Bounty does not exist");

        Bounty storage bounty = bounties[bountyId];

        TokenSubscription tokenSubscription = TokenSubscription(
            bounty.tokenSubscription
        );

        require(msg.sender == tokenSubscription.owner(), "Only owner can unregister");

        delete idOf[bounty.tokenSubscription];
        delete bounties[bountyId];

        emit BountyRemoved(bountyId);
    }

    /**
    * @dev Function to check if payment can be processed
    * @param bountyId The id of the bounty.
    * @param subscriber The address of subscriber
    * @return A boolean to indicate if payment can be processed.
    */
    function canProcessPayment(uint bountyId, address subscriber) public view returns (bool) {
        if (!bountyExists(bountyId)) {
            return false;
        }

        Bounty storage bounty = bounties[bountyId];

        TokenSubscription tokenSub = TokenSubscription(
            bounty.tokenSubscription
        );

        // check if contract has been deleted
        if (tokenSub.owner() == address(0)) {
            return false;
        }

        ERC20 token = ERC20(tokenSub.token());

        uint allowance = token.allowance(tokenSub.owner(), this);

        return (
            allowance >= bounty.amount &&
            tokenSub.canCharge(subscriber)
        );
    }

    /**
    * @dev Function to process subscription, msg.sender receives bounty.amount upon successful transaction.
    * @param bountyId The id of the bounty
    * @param subscriber Address of the subscriber
    */
    function processPayment(uint bountyId, address subscriber) public {
        require(
            canProcessPayment(bountyId, subscriber),
            "Cannot process payment"
        );

        Bounty storage bounty = bounties[bountyId];

        TokenSubscription tokenSub = TokenSubscription(
            bounty.tokenSubscription
        );

        ERC20 token = ERC20(tokenSub.token());

        TokenSubscription(tokenSub).charge(subscriber);

        require(
            token.transferFrom(tokenSub.owner(), msg.sender, bounty.amount),
            "token.transfer from tokenSubscription.owner to msg.sender failed"
        );

        emit PaymentProcessed(bountyId, subscriber);
    }
}
