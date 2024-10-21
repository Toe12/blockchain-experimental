# **Using Node.js as an Application Developer**

This guide covers the prerequisites, setup instructions, and steps to develop an application using Node.js with Hyperledger Fabric.

## Prerequisites

### For Mac:

1. **Homebrew**: Install [Homebrew](https://brew.sh) if not already installed.
2. **Docker Desktop**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
3. **Node.js, jq, and npm**: Install these packages using Homebrew:

   ```sh
   brew install node jq
   ```

4. **Go**: Install Go, as Hyperledger Fabric requires it for certain components:

   ```sh
   brew install go
   ```

### For Linux:

1. **Docker**: Install Docker using your preferred package manager (e.g., `apt-get`, `yum`).
2. **Node.js, jq, and npm**: Install using your package manager (e.g., `apt-get`, `yum`).
3. **Go**: Install Go using your package manager (e.g., `apt-get`, `yum`).

---

## Step 1: Install Fabric Samples, Binaries, and Docker Images

**Note:** This step can be skipped if already installed. Otherwise, execute the following command:

```sh
curl -sSL https://bit.ly/2ysbOFE | bash -s
```

---

## Step 2: Set Up Your Environment

### For Mac:

1. **Add Fabric binaries and configuration to your PATH** by adding the following lines to your `.zshrc` or equivalent:

   ```sh
   echo 'export PATH=$PWD/bin:$PATH' >> ~/.zshrc
   echo 'export FABRIC_CFG_PATH=$PWD/config' >> ~/.zshrc

   echo 'export CORE_PEER_TLS_ENABLED=true' >> ~/.zshrc
   echo 'export CORE_PEER_LOCALMSPID=Org1MSP' >> ~/.zshrc
   echo 'export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem' >> ~/.zshrc
   echo 'export CORE_PEER_MSPCONFIGPATH=${PWD}/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp' >> ~/.zshrc
   echo 'export CORE_PEER_ADDRESS=localhost:7051' >> ~/.zshrc
   ```

2. **Source the profile to apply changes**:

   ```sh
   source ~/.zshrc
   ```

### For Linux:

1. **Add Fabric binaries to your PATH** by adding the following lines to your `~/.bashrc` or equivalent:

   ```sh
   echo 'export PATH=$PWD/bin:$PATH' >> ~/.bashrc
   echo 'export FABRIC_CFG_PATH=$PWD/config' >> ~/.bashrc

   echo 'export CORE_PEER_TLS_ENABLED=true' >> ~/.bashrc
   echo 'export CORE_PEER_LOCALMSPID=Org1MSP' >> ~/.bashrc
   echo 'export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem' >> ~/.bashrc
   echo 'export CORE_PEER_MSPCONFIGPATH=${PWD}/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp' >> ~/.bashrc
   echo 'export CORE_PEER_ADDRESS=localhost:7051' >> ~/.bashrc
   ```

2. **Source the profile to apply changes**:

   ```sh
   source ~/.bashrc
   ```

---

## Step 3: Launch the Test Network

1. **Navigate to the test network directory**:

   ```sh
   cd test-network
   ```

2. **Stop any existing network**:

   ```sh
   ./network.sh down
   ```

3. **Start the test network**:

   ```sh
   ./network.sh up -ca
   ```

4. **Create a channel**:

   ```sh
   ./network.sh createChannel -c mychannel
   ```

---

## Step 4: Install and Instantiate Chaincode

1. **Deploy the chaincode using Node.js**:

   ```sh
   ./network.sh deployCC -ccn basic -ccp ../chaincode-javascript/ -ccl javascript
   ```

---

## Step 5: Set Up the Node.js Application

1. **Navigate to the application directory**:

   ```sh
   cd backend/src
   ```

2. **Install the required Node.js packages**:

   ```sh
   npm install
   ```

3. **Run the application**:

   ```sh
   node app.js
   ```

---

## Step 6: Enroll Users

1. **Enroll Admin User**:

   ```bash
   node caActions.js admin <orgName>
   ```

2. **Register and Enroll Application User**:

   ```bash
   node caActions.js user <orgName> <username>
   ```

---

## Step 7: Verify the Setup

1. **Check Docker containers** to ensure the Hyperledger Fabric components are running:

   ```sh
   docker ps
   ```

2. **Interact with the application** to verify that it is communicating with the Hyperledger Fabric network as expected.

---

## Additional Resources

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.2/)
- [Hyperledger Fabric Samples GitHub](https://github.com/hyperledger/fabric-samples)

---

This README provides a complete guide to setting up and using Node.js as an application developer with Hyperledger Fabric on both Mac and Linux systems. Let me know if there are any further changes or if you want to add more sections!
