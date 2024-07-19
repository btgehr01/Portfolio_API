import axios from "axios";
import getAccessToken from "../auth/token.js";

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
    console.error(e.message);
    return res.status(500).json({ error: "Failed to add song to playlist." });
  }
}
