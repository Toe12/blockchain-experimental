"use strict";

// Importing necessary modules
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class AssetTransfer extends Contract {
  // Initialize the ledger with default assets
  async InitLedger(ctx) {
    const assets = [
      {
        id: "asset1",
        data: {},
      },
    ];

    for (const asset of assets) {
      asset.data.docType = "asset";
      await ctx.stub.putState(
        asset.id,
        Buffer.from(stringify(sortKeysRecursive(asset.data)))
      );
    }
  }

  // CreateAsset now checks for the presence of data and initializes it if necessary
  async CreateAsset(ctx, assetData) {
    const asset = JSON.parse(assetData); // Parse the JSON string received
    const { id, data = {} } = asset; // Destructure id and initialize data as an empty object if undefined

    const exists = await this.AssetExists(ctx, id);
    if (exists) {
      throw new Error(`The asset ${id} already exists`);
    }

    // Ensure docType is set in data
    data.docType = "asset";

    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(data)))
    );
    return JSON.stringify({ id, data });
  }

  // UpdateAsset similarly ensures data is initialized
  async UpdateAsset(ctx, assetData) {
    const asset = JSON.parse(assetData); // Parse the JSON string received
    const { id, data = {} } = asset; // Destructure id and initialize data as an empty object if undefined

    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    // Ensure docType is set in data
    data.docType = "asset";

    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(data)))
    );
    return JSON.stringify({ id, data });
  }

  // DeleteAsset deletes a given asset from the world state
  async DeleteAsset(ctx, id) {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    return ctx.stub.deleteState(id);
  }

  // AssetExists returns true when asset with given ID exists in world state
  async AssetExists(ctx, id) {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }

  // ReadAsset returns the asset stored in the world state with given id
  async ReadAsset(ctx, id) {
    const assetJSON = await ctx.stub.getState(id);
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The asset ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  // TransferAsset updates the owner field of asset with given id in the world state
  async TransferAsset(ctx, id, newOwner) {
    const assetString = await this.ReadAsset(ctx, id);
    const asset = JSON.parse(assetString);
    asset.owner = newOwner;

    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(asset)))
    );
    return `Asset ownership of ${id} transferred to ${newOwner}`;
  }

  // GetAssetHistory returns the history of an asset with given id
  async GetAssetHistory(ctx, id) {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    const iterator = await ctx.stub.getHistoryForKey(id);
    const allResults = [];

    while (true) {
      const res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        const timestamp = res.value.timestamp;
        const txId = res.value.tx_id;
        let asset;

        try {
          asset = JSON.parse(res.value.value.toString("utf8"));
        } catch (err) {
          console.log(err);
          asset = res.value.value.toString("utf8");
        }

        allResults.push({ txId, timestamp, asset });
      }

      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(allResults);
  }

  // GetAllAssets returns all assets found in the world state
  async GetAllAssets(ctx) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange("", "");

    while (true) {
      const result = await iterator.next();

      if (result.value && result.value.value.toString()) {
        const strValue = result.value.value.toString("utf8");
        let record;

        try {
          record = JSON.parse(strValue);
        } catch (err) {
          console.log("Error parsing record:", err);
          record = strValue;
        }

        console.log("Retrieved asset:", record);
        allResults.push(record);
      }

      if (result.done) {
        console.log("No more assets found.");
        await iterator.close();
        break;
      }
    }

    console.log("All assets retrieved:", allResults);
    return JSON.stringify(allResults);
  }
}

module.exports = AssetTransfer;
