const path = require("path");
const fs = require("fs");

/**
 * Loads the existing CCP (Common Connection Profile) for any organization.
 * @param {string} orgName - The name of the organization (e.g., 'org1').
 */
exports.buildCCPForOrg = function (orgName) {
  if (!orgName) {
    throw new Error("Organization name must be provided.");
  }

  // load the common connection configuration file for the specified organization
  const ccpPath = path.resolve(
    __dirname,
    "..",
    "..",
    "test-network",
    "organizations",
    "peerOrganizations",
    `${orgName}.example.com`,
    `connection-${orgName}.json`
  );

  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`No such file or directory: ${ccpPath}`);
  }

  const contents = fs.readFileSync(ccpPath, "utf8");

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  console.log(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

/**
 * Creates a new wallet. Note that the wallet is for managing identities.
 * @param {*} Wallets - The Wallets class from Fabric SDK.
 * @param {string} [walletPath] - Optional path to store wallet files.
 */
exports.buildWallet = async function (Wallets, walletPath) {
  let wallet;
  if (walletPath) {
    wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Built a file system wallet at ${walletPath}`);
  } else {
    wallet = await Wallets.newInMemoryWallet();
    console.log("Built an in-memory wallet");
  }

  return wallet;
};

/**
 * Converts a string to a pretty JSON string format.
 * @param {string} inputString - The string to be converted to pretty JSON.
 * @returns {string} - The pretty-printed JSON string.
 */
exports.prettyJSONString = function (inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
};
