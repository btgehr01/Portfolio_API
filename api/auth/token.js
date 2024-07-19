import axios from "axios";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

export default async function getAccessToken() {
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const data = new URLSearchParams({ grant_type: "client_credentials" });

  console.log(clientId);
  console.log(clientSecret);

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}
