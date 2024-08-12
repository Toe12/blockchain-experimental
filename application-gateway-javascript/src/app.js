const express = require('express');
const {
    connectToGateway,
    utf8Decoder,
    channelName,
    chaincodeName,
} = require('./gateway');

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

app.post('/create-asset', async (req, res) => {
    try {
        const { assetId, color, size, owner, value } = req.body;
        const contract = await getContract();
        await contract.submitTransaction(
            'CreateAsset',
            assetId,
            color,
            size,
            owner,
            value
        );
        res.status(200).send(`Asset ${assetId} created successfully`);
    } catch (error) {
        console.error(`Failed to create asset: ${error}`);
        res.status(500).send(`Error creating asset: ${error.message}`);
    }
}); 

app.get('/assets', async (req, res) => {
    try {
        const contract = await getContract();
        const resultBytes = await contract.evaluateTransaction('GetAllAssets');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        res.status(200).json(result);
    } catch (error) {
        console.error(`Failed to get assets: ${error}`);
        res.status(500).send(`Error retrieving assets: ${error.message}`);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
