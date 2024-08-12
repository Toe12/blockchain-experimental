const grpc = require("@grpc/grpc-js");
const { connect, signers } = require("@hyperledger/fabric-gateway");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { TextDecoder } = require("node:util");

// Define the envOrDefault function
function envOrDefault(key, defaultValue) {
  return process.env[key] || defaultValue;
}

const channelName = envOrDefault("CHANNEL_NAME", "mychannel");
const chaincodeName = envOrDefault("CHAINCODE_NAME", "basic");
const mspId = envOrDefault("MSP_ID", "Org1MSP");

// Path to crypto materials.
const cryptoPath = envOrDefault(
  "CRYPTO_PATH",
  path.resolve(
    __dirname,
    "..",
    "..",
    "test-network",
    "organizations",
    "peerOrganizations",
    "org1.example.com"
  )
);

const keyDirectoryPath = envOrDefault(
  "KEY_DIRECTORY_PATH",
  path.resolve(cryptoPath, "users", "User1@org1.example.com", "msp", "keystore")
);

const certDirectoryPath = envOrDefault(
  "CERT_DIRECTORY_PATH",
  path.resolve(
    cryptoPath,
    "users",
    "User1@org1.example.com",
    "msp",
    "signcerts"
  )
);

const tlsCertPath = envOrDefault(
  "TLS_CERT_PATH",
  path.resolve(cryptoPath, "peers", "peer0.org1.example.com", "tls", "ca.crt")
);

const peerEndpoint = envOrDefault("PEER_ENDPOINT", "localhost:7051");
const peerHostAlias = envOrDefault("PEER_HOST_ALIAS", "peer0.org1.example.com");

const utf8Decoder = new TextDecoder();

async function connectToGateway() {
  const client = await newGrpcConnection();

  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    evaluateOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
    endorseOptions: () => ({ deadline: Date.now() + 15000 }), // 15 seconds
    submitOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
    commitStatusOptions: () => ({ deadline: Date.now() + 60000 }), // 1 minute
  });

  return gateway;
}

async function newGrpcConnection() {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    "grpc.ssl_target_name_override": peerHostAlias,
  });
}

async function newIdentity() {
  const certPath = await getFirstDirFileName(certDirectoryPath);
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function getFirstDirFileName(dirPath) {
  const files = await fs.readdir(dirPath);
  const file = files[0];
  if (!file) throw new Error(`No files in directory: ${dirPath}`);
  return path.join(dirPath, file);
}

async function newSigner() {
  const keyPath = await getFirstDirFileName(keyDirectoryPath);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

module.exports = {
  connectToGateway,
  utf8Decoder,
  channelName,
  chaincodeName,
};
