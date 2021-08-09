const { assert } = require('chai');
const { default: Web3 } = require('web3');

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}
contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap
    before(async() => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address, tokens('1000000'))
    })
    describe('EthSwap deployment', async() => {
        it('contract has a name', async() => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('exchange has tokens', async() => {
            const numberOfTokens = await token.balanceOf(ethSwap.address)
            assert.equal(numberOfTokens.toString(), tokens('1000000'))
        })
    })

    describe('Token deployment', async() => {
        it('token has a name', async() => {
            const name = await token.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Buy Tokens', async() => {
        let result;
        before(async() => {
            //purchase tokens before each example
            result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether') })
        })
        it('Allows users to purchase tokens from ethSwap', async() => {
            //Check investor Balance
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            //Check Eth swap balance
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

            //Check Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })



    describe('Buy Tokens', async() => {
        let result
        before(async() => {
            await token.approve(ethSwap.address, tokens('100'), { from: investor })
            result = await ethSwap.sellTokens(tokens('100'), { from: investor })
        })
        it('Allows users to sell tokens to ethSwap', async() => {

            //Check Balance
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            //Check ethSwap Balance
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

            //Check Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //FAILURE: investor can't sell more tokens than they have
            await ethSwap.sellTokens(tokens('500'), { from: investor }).should.be.rejected;
        })
    })
})