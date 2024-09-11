---

## Prerequisites

1. **Docker Desktop**: Install Docker Desktop for Mac. You can download it [here](https://www.docker.com/products/docker-desktop).

2. **Node.js**: Install Node.js, jq, and npm. You can use Homebrew to install them:

   ```sh
   brew install node
   brew install jq
   ```

---

## Using Node.js as an Application Developer

### Node.js as a Chaincode Example

In this example, we will use the predefined `asset-transfer-basic` chaincode.

1. **Set Up the Network and Chaincode**:

   ```bash
   # Switch to the test network folder
   cd test-network

   # Bring up the network and create a channel
   ./network.sh up createChannel -c channel1 -ca

   # Install the asset-transfer-basic chaincode
   cd ../chaincode-javascript
   npm install
   cd ../../test-network

   export FABRIC_CFG_PATH=$PWD/../config/

   # Package the chaincode
   peer lifecycle chaincode package basic.tar.gz --path ../chaincode-javascript/ --lang node --label basic_1.0

   # Install on peer0 of Org1
   . ./scripts/envVar.sh
   setGlobals 1
   peer lifecycle chaincode install basic.tar.gz

   # Install on peer0 of Org2
   setGlobals 2
   peer lifecycle chaincode install basic.tar.gz

   # Query installed chaincode and get the package ID (PKGID)
   setGlobals 1
   peer lifecycle chaincode queryinstalled --peerAddresses localhost:7051 --tlsRootCertFiles organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

   export PKGID=basic_1.0:d2e3329812d27a187ea1f84b1a2c45cb7bf5e677a139044a3af3188e308f2c89

   # Approve the chaincode for Org1
   peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID channel1 --name basic --version 1 --package-id $PKGID --sequence 1

   # Approve the chaincode for Org2
   setGlobals 2
   peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID channel1 --name basic --version 1 --package-id $PKGID --sequence 1

   # Commit the chaincode
   peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID channel1 --name basic --peerAddresses localhost:7051 --tlsRootCertFiles $PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --version 1 --sequence 1

   # Verify the committed chaincode
   peer lifecycle chaincode querycommitted --channelID channel1 --name basic --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

   # Check if containers are running
   docker ps
   docker-compose -f docker/docker-compose-test-net.yaml ps
   ```

2. **Use the Asset Transfer Chaincode**:

   ```bash
   # Initialize the ledger
   peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'

   # Query all assets
   peer chaincode query -C channel1 -n basic -c '{"Args":["GetAllAssets"]}' | jq .

   # Read a specific asset
   peer chaincode query -C channel1 -n basic -c '{"Args":["ReadAsset","asset1"]}' | jq .

   # Update an asset
   peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"UpdateAsset","Args":["asset1","green","10","Roland","600"]}'
   ```

---

## Node.js Application Setup

1. **Navigate to the application directory**:

   ```sh
   cd backend
   ```

2. **Install the required Node.js packages**:

   ```sh
   npm install
   ```

3. **Run the application**:

   ```sh
   npm run dev
   ```

---

## Chaincode Helper Files

We utilize the following helper files for managing the chaincode and certificate authority (CA) actions:

- `helper.js`
- `caActions.js`
- `ledgerActions.js`

1. **Enroll Admin User**:

   ```bash
   node caActions.js admin
   ```

2. **Register and Enroll Application User**:

   ```bash
   node caActions.js user toearkar
   ```

---

## Additional Resources

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.2/)
- [Hyperledger Fabric Samples GitHub](https://github.com/hyperledger/fabric-samples)

---
