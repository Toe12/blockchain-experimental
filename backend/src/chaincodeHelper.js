const { Gateway, Wallets } = require("fabric-network");
const helper = require("./helper"); // Assuming helper.js exists as per your original code
const path = require("path");
const walletPath = path.join(__dirname, "wallet");

// Setup a function to get the contract from the network
async function getContract(userId) {
  try {
    const ccp = helper.buildCCPOrg1();
    const wallet = await helper.buildWallet(Wallets, walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("channel1");
    return network.getContract("basic");
  } catch (e) {
    throw new Error(`Error in getContract: ${e}`);
  }
}

async function evaluateTransaction(userId, fnName, ...args) {
  try {
    const contract = await getContract(userId);
    const result = await contract.evaluateTransaction(fnName, ...args);
    return result.toString();
  } catch (e) {
    throw new Error(`Error in evaluateTransaction: ${e}`);
  }
}

async function submitTransaction(userId, fnName, ...args) {
  try {
    const contract = await getContract(userId);
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
