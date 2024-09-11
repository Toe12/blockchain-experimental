const express = require("express");
const { TextDecoder } = require("util");
const { evaluateTransaction, submitTransaction } = require("./chaincodeHelper");

const app = express();
app.use(express.json());

const userId = "toe";

app.post("/create-asset", async (req, res) => {
  try {
    const { assetId, name, policyNumber, owner } = req.body;
    const result = await submitTransaction(
      userId,
      "CreateAsset",
      assetId,
      name,
      policyNumber,
      owner
    );
    res.status(201).send(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to create asset: ${error}`);
    res.status(500).send(`Error creating asset: ${error.message}`);
  }
});

app.put("/update-asset", async (req, res) => {
  try {
    const { assetId, name, policyNumber, owner } = req.body;
    await submitTransaction(
      userId,
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
    const result = await evaluateTransaction(userId, "GetAllAssets");
    res.status(200).json(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to get assets: ${error}`);
    res.status(500).send(`Error retrieving assets: ${error.message}`);
  }
});

app.get("/asset-history/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    const result = await evaluateTransaction(
      userId,
      "GetAssetHistory",
      assetId
    );
    res.status(200).json(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to get assets: ${error}`);
    res.status(500).send(`Error retrieving assets: ${error.message}`);
  }
});

app.get("/asset/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    const result = await evaluateTransaction(userId, "ReadAsset", assetId);
    res.status(200).json(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to get assets: ${error}`);
    res.status(500).send(`Error retrieving assets: ${error.message}`);
  }
});

// Define a route to delete an asset by ID
app.delete("/delete-asset/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    await submitTransaction(userId, "DeleteAsset", assetId);
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
    const oldOwner = await submitTransaction(
      userId,
      "TransferAsset",
      assetId,
      newOwner
    );
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
