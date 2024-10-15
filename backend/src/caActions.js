/**
 * Certificate Authority - Actions
 */

// node.js includes
const path = require("path");

// own helper functions
const helper = require("./helper");

// fabric includes
const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");

// CA admin credentials (these can be set per organization)
const adminUserId = "admin";
const adminUserPasswd = "adminpw";

// wallet paths
const walletPaths = {
  org1: path.join(__dirname, "wallet-org1"),
  org2: path.join(__dirname, "wallet-org2"),
};

/**
 * Create a new CA client for interacting with the CA
 * @param {*} FabricCAServices
 * @param {*} ccp
 * @param {*} caHostName
 */
function buildCAClient(FabricCAServices, ccp, caHostName) {
  const caInfo = ccp.certificateAuthorities[caHostName];
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const caClient = new FabricCAServices(
    caInfo.url,
    { trustedRoots: caTLSCACerts, verify: false },
    caInfo.caName
  );

  console.log(`Built a CA Client named ${caInfo.caName}`);
  return caClient;
}

/**
 * Enroll an Admin user
 * @param {*} caClient
 * @param {*} wallet
 * @param {*} orgMspId
 */
async function enrollAdmin(caClient, wallet, orgMspId) {
  try {
    const identity = await wallet.get(adminUserId);
    if (identity) {
      console.log(
        "An identity for the admin user already exists in the wallet"
      );
      return;
    }

    const enrollment = await caClient.enroll({
      enrollmentID: adminUserId,
      enrollmentSecret: adminUserPasswd,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: "X.509",
    };
    await wallet.put(adminUserId, x509Identity);
    console.log(
      "Successfully enrolled admin user and imported it into the wallet"
    );
  } catch (error) {
    console.error(`Failed to enroll admin user: ${error}`);
  }
}

/**
 * Register and enroll an application user
 * @param {*} caClient
 * @param {*} wallet
 * @param {*} orgMspId
 * @param {*} userId
 * @param {*} affiliation
 */
async function registerAndEnrollUser(
  caClient,
  wallet,
  orgMspId,
  userId,
  affiliation
) {
  try {
    const userIdentity = await wallet.get(userId);
    if (userIdentity) {
      console.log(
        `An identity for the user ${userId} already exists in the wallet`
      );
      return;
    }

    const adminIdentity = await wallet.get(adminUserId);
    if (!adminIdentity) {
      console.log(
        "An identity for the admin user does not exist in the wallet"
      );
      console.log("Enroll the admin user before retrying");
      return;
    }

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

    const secret = await caClient.register(
      {
        affiliation: affiliation,
        enrollmentID: userId,
        role: "client",
      },
      adminUser
    );
    const enrollment = await caClient.enroll({
      enrollmentID: userId,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: "X.509",
    };
    await wallet.put(userId, x509Identity);
    console.log(
      `Successfully registered and enrolled user ${userId} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to register user ${userId}: ${error}`);
  }
}

/**
 * Enroll an admin user for a given organization
 * @param {string} orgName - The name of the organization (e.g., "org1")
 */
async function getAdmin(orgName) {
  let ccp = helper.buildCCPForOrg(orgName); // Dynamically build the CCP for the given org

  const caClient = buildCAClient(
    FabricCAServices,
    ccp,
    `ca.${orgName}.example.com`
  );

  const wallet = await helper.buildWallet(Wallets, walletPaths[orgName]); // Use the wallet specific to each org

  if (orgName === "org1") {
    await enrollAdmin(caClient, wallet, "Org1MSP");
  } else if (orgName === "org2") {
    await enrollAdmin(caClient, wallet, "Org2MSP");
  } else {
    throw new Error("Organization not recognized");
  }
}

/**
 * Register and enroll an application user for a given organization
 * @param {string} orgName - The name of the organization (e.g., "org1")
 * @param {string} userId - The user ID for the new user to be registered and enrolled
 */
async function getUser(orgName, userId) {
  let ccp = helper.buildCCPForOrg(orgName); // Dynamically build the CCP for the given org

  const caClient = buildCAClient(
    FabricCAServices,
    ccp,
    `ca.${orgName}.example.com`
  );

  const wallet = await helper.buildWallet(Wallets, walletPaths[orgName]);

  if (orgName === "org1") {
    await registerAndEnrollUser(
      caClient,
      wallet,
      "Org1MSP",
      userId,
      "org1.department1"
    );
  } else if (orgName === "org2") {
    await registerAndEnrollUser(
      caClient,
      wallet,
      "Org2MSP",
      userId,
      "org2.department1"
    );
  } else {
    throw new Error("Organization not recognized");
  }
}

let args = process.argv;

if (args[2] === "admin") {
  const orgName = args[3];
  getAdmin(orgName);
} else if (args[2] === "user") {
  const orgName = args[3];
  const userId = args[4];
  getUser(orgName, userId);
} else {
  console.log("Usage: node caActions.js <admin|user> <orgName> [userId]");
}
