const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

export function GET(request) {
  return new Response(`Hello from KY ${accessToken} ${playlistId}`);
}
