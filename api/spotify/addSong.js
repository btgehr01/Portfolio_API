import axios from "axios";
import cookie from "cookie";

const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

async function getPlaylistTracks(token) {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.items.map((item) => item.track.uri);
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    throw error;
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

  console.log(req);

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.spotify_access_token;
  console.log(token);

  if (!token) {
    console.log("Access token is null");
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { songURI } = req.body;

  if (!songURI) {
    return res.status(400).json({ error: "songURI is required." });
  }

  try {
    const existingTracks = await getPlaylistTracks(token);

    if (existingTracks.includes(songURI)) {
      return res
        .status(400)
        .json({ error: "Song is already in the playlist." });
    }

    const postData = {
      uris: [songURI],
      position: 0,
    };
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      postData,
      config
    );

    return res.status(200).json({ message: "Song added to playlist." });
  } catch (e) {
    console.error("Failed to add song to playlist:", e.message);
    if (e.response && e.response.status === 401) {
      return res.redirect("https://bradygehrman-api.vercel.app/api/auth/login");
    }
    return res.status(500).json({ error: "Failed to add song to playlist." });
  }
}
