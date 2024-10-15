const { Gateway, Wallets } = require("fabric-network");
const helper = require("./helper");
const path = require("path");

// Function to dynamically get the wallet path based on the organization
function getWalletPath(org) {
  return path.join(__dirname, `wallet-${org}`);
}

// Setup a function to get the contract from the network
async function getContract(userId, org, channel, chaincode) {
  try {
    const ccp = helper.buildCCPForOrg(org);

    // Dynamically set the wallet path based on the organization
    const walletPath = getWalletPath(org);

    const wallet = await helper.buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork(channel);
    return network.getContract(chaincode);
  } catch (e) {
    throw new Error(`Error in getContract: ${e}`);
  }
}

async function evaluateTransaction(
  userId,
  org,
  channel,
  chaincode,
  fnName,
  ...args
) {
  try {
    const contract = await getContract(userId, org, channel, chaincode);
    const result = await contract.evaluateTransaction(fnName, ...args);
    return result.toString();
  } catch (e) {
    throw new Error(`Error in evaluateTransaction: ${e}`);
  }
}

async function submitTransaction(
  userId,
  org,
  channel,
  chaincode,
  fnName,
  ...args
) {
  try {
    const contract = await getContract(userId, org, channel, chaincode);
    const result = await contract.submitTransaction(fnName, ...args);
    return result.toString();
  } catch (e) {
    throw new Error(`Error in submitTransaction: ${e}`);
  }
}

module.exports = {
  evaluateTransaction,
  submitTransaction,
};
