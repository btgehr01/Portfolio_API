import querystring from "querystring";
import crypto from "crypto";
import cookie from "cookie";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

function generateRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

export default function handler(req, res) {
  const state = generateRandomString(16);
  const scopes = "playlist-modify-public user-read-email";

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("spotify_auth_state", state, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 5,
      path: "/",
      domain: ".bradygehrman-api.vercel.app",
      sameSite: "strict",
    })
  );

  const redirectUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirect_uri,
      state: state,
    });

  return res.redirect(redirectUrl);
}
