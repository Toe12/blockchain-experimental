const express = require("express");
const { evaluateTransaction, submitTransaction } = require("./chaincodeHelper");

const app = express();
app.use(express.json());

// These values should be retrieved from the database or a config file
const userId = "admin";
const org = "org1";
const channel = "mychannel";
const chaincodeName = "basic";

app.post("/create-asset", async (req, res) => {
  try {
    const { id, data } = req.body;

    // Log parameters to verify they are defined
    console.log("Received asset data:", { id, data });

    const result = await submitTransaction(
      userId,
      org,
      channel,
      chaincodeName,
      "CreateAsset",
      JSON.stringify({ id, data })
    );
    res.status(201).send(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to create asset: ${error}`);
    res.status(500).send(`Error creating asset: ${error.message}`);
  }
});

app.put("/update-asset", async (req, res) => {
  try {
    const { id, data } = req.body;

    // Log parameters to verify they are defined
    console.log("Received asset data for update:", { id, data });

    await submitTransaction(
      userId,
      org,
      channel,
      chaincodeName,
      "UpdateAsset",
      JSON.stringify({ id, data })
    );
    res.status(200).send(`Asset ${id} updated successfully`);
  } catch (error) {
    console.error(`Failed to update asset: ${error}`);
    res.status(500).send(`Error updating asset: ${error.message}`);
  }
});

app.get("/assets", async (req, res) => {
  try {
    const result = await evaluateTransaction(
      userId,
      org,
      channel,
      chaincodeName,
      "GetAllAssets"
    );
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
      org,
      channel,
      chaincodeName,
      "GetAssetHistory",
      assetId
    );
    res.status(200).json(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to get asset history: ${error}`);
    res.status(500).send(`Error retrieving asset history: ${error.message}`);
  }
});

app.get("/asset/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    const result = await evaluateTransaction(
      userId,
      org,
      channel,
      chaincodeName,
      "ReadAsset",
      assetId
    );
    res.status(200).json(JSON.parse(result));
  } catch (error) {
    console.error(`Failed to get asset: ${error}`);
    res.status(500).send(`Error retrieving asset: ${error.message}`);
  }
});

// Define a route to delete an asset by ID
app.delete("/delete-asset/:id", async (req, res) => {
  const assetId = req.params.id;
  try {
    await submitTransaction(
      userId,
      org,
      channel,
      chaincodeName,
      "DeleteAsset",
      assetId
    );
    res.status(200).send(`Asset with ID ${assetId} has been deleted.`);
  } catch (error) {
    console.error(`Failed to delete asset: ${error}`);
    res.status(500).send(`Error deleting asset: ${error.message}`);
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
      org,
      channel,
      chaincodeName,
      "TransferAsset",
      assetId,
      newOwner
    );
    res.status(200).json({ assetId, oldOwner, newOwner });
  } catch (error) {
    console.error(`Failed to transfer asset with ID ${assetId}: ${error}`);
    res.status(500).send(`Error transferring asset: ${error.message}`);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
