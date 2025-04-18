import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(process.env.MONGODB_URI!);
const db = mongoClient.db("collabconnect");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type, record } = req.body; // Supabase sends event type & record

        if (!type || !record) {
            return res.status(400).json({ error: "Invalid request payload" });
        }

        if (type === 'INSERT') {
            await db.collection('projects').insertOne(record);
        } else if (type === 'UPDATE') {
            await db.collection('projects').updateOne({ id: record.id }, { $set: record });
        } else if (type === 'DELETE') {
            await db.collection('projects').deleteOne({ id: record.id });
        }

        return res.status(200).json({ message: "Synced successfully" });
    } catch (error) {
        console.error("Sync Error:", error);
        return res.status(500).json({ error: "Sync failed" });
    }
}
