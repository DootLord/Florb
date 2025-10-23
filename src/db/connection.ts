import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

console.log('Environment Variables:', {
    MONGO_URL: process.env.MONGO_URL,
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV
});

//? Might be a better place for this to live somewhere else?
if(!process.env.MONGO_URL || !process.env.DB_NAME) {
    throw new Error('MONGO_URL and DB_NAME must be defined in environment variables');
}

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

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
