import { MongoClient, Db } from 'mongodb';

const uri = 'mongodb://localhost:27013/';
const dbName = 'florb';

const client = new MongoClient(uri);
let db: Db;

export const connectToDatabase = async (): Promise<Db> => {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB');
    }
    return db;
};

export default client;
