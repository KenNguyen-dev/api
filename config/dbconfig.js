const {MongoClient} = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function main(){
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log("Successfully connected to the databases.");
    } catch (e) {
        console.error(e);
    }
}
main().catch(console.error);

module.exports = client.db('NFTMarketDB');
