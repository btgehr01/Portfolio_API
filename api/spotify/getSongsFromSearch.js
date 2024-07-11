import axios from "axios";

const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;

export default async function handler(req, res) {
  const { searchString } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: "Spotify access token is missing." });
  }

  if (searchString) {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchString
        )}&type=track&limit=10&include_external=audio`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res.status(200).json(response.data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to search for songs." });
    }
  } else {
    return res.status(400).json({ error: "searchString is required." });
  }
}
