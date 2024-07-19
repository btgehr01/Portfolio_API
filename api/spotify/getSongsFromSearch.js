import axios from "axios";
import getAccessToken from "../auth/token.js";

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
  const { searchString } = req.query;

  if (!searchString) {
    return res.status(400).json({ error: "searchString is required." });
  }

  let token = null;

  try {
    token = await getAccessToken();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to get access token." });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchString
      )}&type=track&market=US&limit=20&offset=0`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to search for songs." });
  }
}
