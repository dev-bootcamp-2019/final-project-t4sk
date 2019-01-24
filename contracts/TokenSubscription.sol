pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract TokenSubscription is Ownable, Pausable {
    using SafeMath for uint;

    event Subscribed(uint indexed subscriberId, address indexed subscriber);
    event Unsubscribed(uint subscriberId, address indexed subscriber);
    event Charged(uint indexed subscriberId, address indexed subscriber);

    address public token;
    uint public paymentAmount;
    uint public paymentInterval;

    struct Subscriber {
        address addr;
        uint startTimestamp;
        uint nextPaymentTimestamp;
    }

    /**
    * @dev nonce to keep track of latest subscriber id
    */
    uint public nonce;
    // TODO iterable map for subscribers ?
    mapping(address => uint) public idOf;
    mapping(uint => Subscriber) public subscribers;

    /**
    * @param _token The address of ERC20 token to collect for payment.
    * @param _paymentAmount The amount of token to collect per time period.
    * @param _paymentInterval The interval between payments in seconds.
    */
    constructor(address _token, uint _paymentAmount, uint _paymentInterval) public {
        require(_token != address(0), "Token address cannot be 0");
        require(_paymentAmount > 0, "Amount must be greater than 0");
        require(_paymentInterval > 0, "Payment interval must be greater than 0");

        token = _token;
        paymentAmount =_paymentAmount;
        paymentInterval = _paymentInterval;
    }

    /**
    * @dev Function to check if an address is subscribed or not.
    * @param addr The address to check if subscribed.
    * @return A boolean indicating if the address is subscribed.
    */
    function isSubscribed(address addr) public view returns (bool) {
        return idOf[addr] != 0;
    }

    /**
    * @dev Function to subscribe to this contract
    */
    function subscribe() public whenNotPaused {
        require(!isSubscribed(msg.sender), "Sender is already subscribed");

        nonce = nonce.add(1);

        idOf[msg.sender] = nonce;
        subscribers[nonce] = Subscriber({
            addr: msg.sender,
            startTimestamp: block.timestamp,
            nextPaymentTimestamp: block.timestamp
        });

        emit Subscribed(nonce, msg.sender);
    }

    /**
    * @dev Function to unsubscribe from this contract
    */
    function unsubscribe() public whenNotPaused {
        require(isSubscribed(msg.sender), "Sender is not subscribed");

        uint id = idOf[msg.sender];

        delete idOf[msg.sender];
        delete subscribers[id];

        emit Unsubscribed(id, msg.sender);
    }

    /**
    * @dev Function to check if a subscriber can be charged or not.
    * @param addr The address of the subscriber
    * @return A boolean value that indicates if the subscriber can be charged.
    */
    function canCharge(address addr) public view returns (bool) {
        if (!isSubscribed(addr)) {
            return false;
        }

        Subscriber storage subscriber = subscribers[idOf[addr]];

        uint allowance = ERC20(token).allowance(subscriber.addr, this);
        uint balance = ERC20(token).balanceOf(subscriber.addr);

        return (
            !paused() &&
            block.timestamp >= subscriber.nextPaymentTimestamp &&
            allowance >= paymentAmount &&
            balance >= paymentAmount
        );
    }

    /**
    * @dev Function to transfer token from subscriber to contract owner
    * @param addr The address of the subscriber
    */
    function charge(address addr) public whenNotPaused {
        require(canCharge(addr), "Subscriber is not ready to be charged");

        uint id = idOf[addr];
        Subscriber storage subscriber = subscribers[id];

        // TODO simpler way to calculate next payment ? nextPaymentTimestamp = start - ((block - start) % interval) + interval
        /**
        * @dev numElapsedInterval = (block.timestamp - subscriber.startTimestamp) / paymentInterval
        */
        uint numElapsedIntervals = (
            block.timestamp.sub(subscriber.startTimestamp)
        ).div(paymentInterval);

        /**
        * @dev nextPaymentTimestamp = startTimestamp + (numElapsedInterval + 1) * paymentInterval
        */
        subscriber.nextPaymentTimestamp = subscriber.startTimestamp.add(
            (numElapsedIntervals.add(1)).mul(paymentInterval)
        );

        require(ERC20(token).transferFrom(subscriber.addr, owner(), paymentAmount));

        emit Charged(id, addr);
    }

    /**
    * @dev Function to kill this contract
    */
    function kill() external onlyOwner {
        selfdestruct(owner());
    }
}
