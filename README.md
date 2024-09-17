## Using Node.js as an Application Developer

### Node.js as a Chaincode Example

1. **Set Up the Network**:  
   Run the following script to set up the Hyperledger Fabric network and create the required channels.

   ```sh
   ./setup.sh
   ```

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

### Chaincode Helper Files

We utilize the following helper files for managing the chaincode and certificate authority (CA) actions:

- `helper.js`
- `caActions.js`
- `ledgerActions.js`

1. **Enroll Admin User**:

   Use the following command to enroll the admin user:

   ```bash
   node caActions.js admin
   ```

2. **Register and Enroll Application User**:

   Use this command to register and enroll a new application user, such as `toearkar`:

   ```bash
   node caActions.js user toearkar
   ```

## Additional Resources

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.2/)
- [Hyperledger Fabric Samples GitHub](https://github.com/hyperledger/fabric-samples)
