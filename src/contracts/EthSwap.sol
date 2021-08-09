pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = 'EthSwap Instant Exchange';
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable{
        // Redemption Rate = 100 DApp
        //Amount of Eth * Redemption Rate
        uint tokenAmount = msg.value * rate;

        require(token.balanceOf(address(this)) >= tokenAmount);
                
        token.transfer(msg.sender, tokenAmount);
        //trigger an event
        emit TokensPurchased(msg.sender , address(token), tokenAmount, rate);
    }



    function sellTokens(uint _amount) public {
        //User can't sell
        require(token.balanceOf(msg.sender)>= _amount);
        //Amount to ether
        uint etherAmount = _amount/rate;

        //Check enough ether in exchange
        require(address(this).balance >= etherAmount);
        // Perform sale
        token.transferFrom(msg.sender , address(this), _amount);
        msg.sender.transfer(etherAmount);

        //trigger event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}
