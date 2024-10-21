const { GenericContainer } = require("testcontainers");
const fs = require("fs");
const path = require("path");
const { Wallets, Gateway } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");

// Define variables for Docker containers
let fabricPeerContainer;
let fabricOrdererContainer;

beforeAll(async () => {
  fabricPeerContainer = new GenericContainer("hyperledger/fabric-peer")
    .withExposedPorts(7051)
    .withEnv("CORE_PEER_ID", "peer0.org1.example.com")
    .withEnv("CORE_PEER_ADDRESS", "peer0.org1.example.com:7051")
    .withEnv("CORE_PEER_LOCALMSPID", "Org1MSP")
    .withEnv("CORE_PEER_MSPCONFIGPATH", "/etc/hyperledger/fabric/msp");

  await fabricPeerContainer.start();
});

afterAll(async () => {
  // Stop the containers
  await fabricPeerContainer.stop();
  if (fabricOrdererContainer) {
    await fabricOrdererContainer.stop();
  }
});

// Helper function to enroll an admin identity for testing
const enrollAdmin = async (caClient, wallet, mspId) => {
  const adminIdentity = await wallet.get("admin");
  if (!adminIdentity) {
    const enrollment = await caClient.enroll({
      enrollmentID: "admin",
      enrollmentSecret: "adminpw", // Replace with the actual secret if needed
    });

    const identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId,
      type: "X.509",
    };
    await wallet.put("admin", identity);
  }
};

// Helper function to set up the Fabric network
const setupFabricNetwork = async () => {
  const ccpPath = path.resolve(__dirname, "connection-profile.json");
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

  // Create a new CA client for interacting with the CA.
  const caURL = ccp.certificateAuthorities["ca.org1.example.com"].url;
  const caClient = new FabricCAServices(caURL);

  // Create an in-memory wallet to store identities
  const wallet = await Wallets.newInMemoryWallet();

  // Enroll the admin user, and store the credentials in the wallet
  await enrollAdmin(caClient, wallet, "Org1MSP");

  // Create a new gateway for connecting to the Fabric network
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "admin",
    discovery: { enabled: true, asLocalhost: true },
  });

  // Get the network (channel) our contract is deployed to
  const network = await gateway.getNetwork("mychannel");
  const contract = network.getContract("mySmartContract");

  return contract;
};

describe("Hyperledger Fabric Integration Test", () => {
  let contract;

  beforeAll(async () => {
    // Set up the Fabric network and contract interaction
    contract = await setupFabricNetwork();
  });

  test("should submit a transaction and retrieve the result", async () => {
    const result = await contract.submitTransaction(
      "createAsset",
      "asset1",
      "blue",
      "10",
      "Tom"
    );
    console.log("Transaction result:", result.toString());

    const queryResult = await contract.evaluateTransaction(
      "readAsset",
      "asset1"
    );
    console.log("Query result:", queryResult.toString());
    expect(queryResult.toString()).toContain("Tom");
  });

  test("should fail to create an asset with invalid data", async () => {
    try {
      await contract.submitTransaction("createAsset", "", "", "", "");
    } catch (error) {
      expect(error.message).toContain("Error");
    }
  });
});
