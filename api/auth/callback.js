import axios from "axios";
import cookie from "cookie";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const frontend_url = process.env.FRONTEND_URL;

export default async function handler(req, res) {
  const { code, state } = req.query;
  console.log("state from request", state);
  const cookies = cookie.parse(req.headers.cookie || "");
  console.log("cookies", cookies);
  const storedState = cookies.spotify_auth_state;

  const defaultErrorMessage =
    "Error logging into Spotify account. Please try again or contact the site admin if the issue persists.";

  if (!state || state !== storedState) {
    console.error("State is null or was altered.");
    const errorMessage = encodeURIComponent(defaultErrorMessage);
    return res.redirect(`${frontend_url}/error?errorMessage=${errorMessage}`);
  } else {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("spotify_auth_state", "", {
        httpOnly: true,
        secure: true,
        maxAge: -1,
        path: "/",
        domain: ".bradygehrman-api.vercel.app",
        sameSite: "strict",
      })
    );

    try {
      const params = new URLSearchParams();
      params.append("code", code);
      params.append("redirect_uri", redirect_uri);
      params.append("grant_type", "authorization_code");

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        params.toString(),
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
          domain: ".bradygehrman-api.vercel.app",
          sameSite: "strict",
        })
      );

      return res.redirect(frontend_url);
    } catch (error) {
      console.error("Error exchanging authorization code:", error);
      const errorMessage = encodeURIComponent(defaultErrorMessage);
      return res.redirect(`${frontend_url}/error?errorMessage=${errorMessage}`);
    }
  }
}
