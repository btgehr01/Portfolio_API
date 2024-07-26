import { MongoClient, ObjectId } from "mongodb";
import axios from "axios";
import getAccessToken from "../auth/token.js";

const uri = process.env.MONGODB_CONNECTION_STRING;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const documentId = process.env.DOCUMENT_ID;
const MAX_IDS_PER_REQUEST = 50;

export default async function handler(req, res) {
  const allowedOrigins = [
    "https://bradygehrman.vercel.app",
    "http://localhost:3000",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    console.log("connecting");
    await client.connect();
    console.log("connected");
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const document = await collection.findOne({
      _id: new ObjectId(documentId),
    });

    console.log(document);

    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }

    const songIDs = document.songIDs || [];

    if (songIDs.length === 0) {
      return res.status(200).json({ message: "No songs to fetch." });
    }

    const ids = songIDs.slice(0, MAX_IDS_PER_REQUEST).join(",");

    console.log(ids);

    const encodedIds = encodeURIComponent(ids);

    console.log(encodedIds);

    let token = null;

    try {
      token = await getAccessToken();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to get access token." });
    }

    const response = await axios.get(
      `https://api.spotify.com/v1/tracks?ids=${encodedIds}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to fetch playlist songs:", error.message);
    return res.status(500).json({ error: "Failed to fetch playlist songs." });
  } finally {
    await client.close();
  }
}
