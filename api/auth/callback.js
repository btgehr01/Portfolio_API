import axios from "axios";
import cookie from "cookie";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const redirect_uri_2 = process.env.FRONTEND_URL;
const loginURL = process.env.LOGIN_URL;

export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookies = cookie.parse(req.headers.cookie || "");
  const storedState = cookies.spotify_auth_state;

  if (!state || state !== storedState) {
    console.error("Response state is null or was altered");
    res.redirect(loginURL);
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      }
    );

    const { access_token } = response.data;

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("access_token", access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60,
        path: "/",
        sameSite: "strict",
      })
    );

    res.redirect(redirect_uri_2);
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    res.redirect(loginURL);
  }
}
