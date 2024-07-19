import axios from "axios";

const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

export default async function handler(req, res) {
  const { songURI } = req.query;

  if (!songURI) {
    return res.status(400).json({ error: "songURI is required." });
  }

  let token = null;

  try {
    token = await getAccessToken();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to get access token." });
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
}
