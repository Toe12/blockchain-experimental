const express = require("express");
const {
  connectToGateway,
  utf8Decoder,
  channelName,
  chaincodeName,
} = require("./gateway");

const app = express();
app.use(express.json());

let contract;

async function getContract() {
  if (!contract) {
    const gateway = await connectToGateway();
    const network = gateway.getNetwork(channelName);
    contract = network.getContract(chaincodeName);
  }
  return contract;
}

app.post("/create-asset", async (req, res) => {
  try {
    const { assetId, name, policyNumber, owner } = req.body;
    const contract = await getContract();
    await contract.submitTransaction(
      "CreateAsset",
      assetId,
      name,
      policyNumber,
      owner
    );
    res.status(200).send(`Asset ${assetId} created successfully`);
  } catch (error) {
    console.error(`Failed to create asset: ${error}`);
    res.status(500).send(`Error creating asset: ${error.message}`);
  }
});

app.put("/update-asset", async (req, res) => {
  try {
    const { assetId, name, policyNumber, owner } = req.body;
    const contract = await getContract();
    await contract.submitTransaction(
      "UpdateAsset",
      assetId,
      name,
      policyNumber,
      owner
    );
    res.status(200).send(`Asset ${assetId} updated successfully`);
  } catch (error) {
    console.error(`Failed to create asset: ${error}`);
    res.status(500).send(`Error creating asset: ${error.message}`);
  }
});

app.get("/assets", async (req, res) => {
  try {
    const contract = await getContract();
    const resultBytes = await contract.evaluateTransaction("GetAllAssets");
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Failed to get assets: ${error}`);
    res.status(500).send(`Error retrieving assets: ${error.message}`);
  }
});

app.get("/asset-history/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    const contract = await getContract();
    const resultBytes = await contract.evaluateTransaction(
      "GetAssetHistory",
      assetId
    );
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Failed to get assets: ${error}`);
    res.status(500).send(`Error retrieving assets: ${error.message}`);
  }
});

app.get("/asset/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    const contract = await getContract();
    const resultBytes = await contract.evaluateTransaction(
      "ReadAsset",
      assetId
    );
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Failed to get assets: ${error}`);
    res.status(500).send(`Error retrieving assets: ${error.message}`);
  }
});

// Define a route to delete an asset by ID
app.delete("/delete-asset/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    const contract = await getContract();
    await contract.evaluateTransaction("DeleteAsset", assetId);
    res.status(200).send(`Asset with ID ${assetId} has been deleted.`);
  } catch (error) {
    console.error(`Failed to get assets: ${error}`);
    res.status(500).send(`Error delete assets: ${error.message}`);
  }
});

// Define a route to transfer an asset to a new owner
app.put("/asset/transfer", async (req, res) => {
  const { assetId, newOwner } = req.body;

  if (!assetId || !newOwner) {
    return res.status(400).send("Asset ID and new owner are required.");
  }

  try {
    const contract = await getContract(); // Function to get the contract instance
    const oldOwnerBytes = await contract.submitTransaction(
      "TransferAsset",
      assetId,
      newOwner
    );
    const oldOwner = utf8Decoder.decode(oldOwnerBytes);
    res.status(200).json({ assetId, oldOwner, newOwner });
  } catch (error) {
    console.error(`Failed to transfer asset with ID ${assetId}: ${error}`);
    res
      .status(500)
      .send(`Error transferring asset with ID ${assetId}: ${error.message}`);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
