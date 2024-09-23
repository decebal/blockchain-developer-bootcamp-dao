// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const NAME = 'Dapp University'
  const SYMBOL = 'DAPP'
  const MAX_SUPPLY = '1000000'

  //https://developers.circle.com/stablecoins/docs/usdc-on-test-networks
  // const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' //Ethereum Mainnet
  // const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' //Ethereum Sepolia
  const USDC_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' //DAPP Token

  // Deploy Token
  const Token = await hre.ethers.getContractFactory('Token')
  let token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)

  await token.deployed()
  console.log(`Token deployed to: ${token.address}\n`)

  // Deploy DAO
  const DAO = await hre.ethers.getContractFactory('DAO')
  const dao = await DAO.deploy(token.address, '500000000000000000000001')
  await dao.deployed()

  console.log(`DAO deployed to: ${dao.address}\n`)

  // Deploy DAO USDC
  const DAO_USDC = await hre.ethers.getContractFactory('DAO_USDC')
  const dao_usdc = await DAO_USDC.deploy(token.address, '500000000000000000000001', USDC_ADDRESS)
  await dao_usdc.deployed()

  console.log(`DAO_USDC deployed to: ${dao_usdc.address}\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
