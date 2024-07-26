import axios from "axios";
import cookie from "cookie";
import nodemailer from "nodemailer";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_CONNECTION_STRING;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const documentId = process.env.DOCUMENT_ID;

async function sendEmailToAdmin(spotifyUsername, songId) {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.MY_EMAIL_USERNAME,
    subject: `Spotify Song Request from ${spotifyUsername}`,
    html: `
      <p>Hello Admin,</p>
      <p><strong>${spotifyUsername}</strong> has requested to add a song to the collaborative playlist <strong>"Shared Vibes"</strong>.</p>
      <p>Song ID: <strong>${songId}</strong></p>
      <p>Please review and add the song to the playlist.</p>
      <p>Thank you!</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending playlist update email:", error);
  }
}

async function fetchSpotifyUsername(token) {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.display_name;
  } catch (error) {
    console.error("Failed to fetch Spotify username:", error.message);
  }
}

export default async function handler(req, res) {
  const allowedOrigins = [
    "https://bradygehrman.vercel.app",
    "http://localhost:3000",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const cookies = cookie.parse(req.headers.cookie || "");

  const token = cookies.access_token;

  if (!token) {
    console.error("Access token is null, unauthorized.");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { songID } = req.body;

  if (!songID) {
    return res.status(400).json({ error: "songId is required." });
  }

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const existingSong = await collection.findOne({
      _id: new ObjectId(documentId),
      songIDs: songID,
    });

    if (existingSong) {
      return res
        .status(409)
        .json({ error: "This song is already in the playlist." });
    }

    await collection.updateOne(
      { _id: new ObjectId(documentId) },
      { $push: { songIDs: songID } }
    );

    const spotifyUsername = await fetchSpotifyUsername(token);
    await sendEmailToAdmin(spotifyUsername, songID);
    return res.status(200).json({ message: "Song added to playlist." });
  } catch (e) {
    console.error("Failed to add song to playlist:", e.message);
    return res.status(500).json({ error: "Failed to add song to playlist." });
  } finally {
    await client.close();
  }
}
