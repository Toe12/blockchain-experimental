#!/bin/bash

export PATH=${PWD}/bin:$PATH

currentDir=$(pwd)

# Switch to the test network folder
cd test-network

./network.sh down

# Bring up the network and create a channel
./network.sh up createChannel -c channel1 -ca

export FABRIC_CFG_PATH=$currentDir/config

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
export PKGID=$(peer lifecycle chaincode queryinstalled --peerAddresses localhost:7051 --tlsRootCertFiles organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt | grep "basic_1.0" | awk -F 'Package ID: ' '{print $2}' | awk -F ',' '{print $1}' | tr -d ' ')

# Print the captured PKGID for verification
echo "PKGID is $PKGID"

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
#docker ps

#docker-compose -f compose/docker/docker-compose-test-net.yaml ps

# # Initialize the ledger
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C channel1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'
