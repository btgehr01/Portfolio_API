import axios from "axios";

const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

export default async function handler(req, res) {
  const { songURI } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: "Spotify access token is missing." });
  }

  if (songURI) {
    const postData = {
      uris: [songURI],
      position: 0,
    };
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        postData,
        config
      );
      return res.status(200).json({ message: "Song added to playlist." });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to add song to playlist." });
    }
  } else {
    return res.status(400).json({ error: "songURI is required." });
  }
}
