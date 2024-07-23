import crypto from "crypto";
import cookie from "cookie";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

function generateRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

export default function handler(req, res) {
  const state = generateRandomString(16);
  const scopes =
    "user-read-email playlist-modify-public user-modify-playback-state";

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("spotify_auth_state", state, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 5,
      path: "/",
      sameSite: "lax",
    })
  );

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: state,
  });

  const redirectUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return res.redirect(redirectUrl);
}
