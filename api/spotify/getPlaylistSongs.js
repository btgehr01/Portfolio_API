import axios from "axios";

const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

export default async function handler(req, res) {
  if (!accessToken) {
    return res.status(400).json({ error: "Spotify access token is missing." });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=0&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to get playlist songs." });
  }
}
