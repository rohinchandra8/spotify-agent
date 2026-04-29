import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

load_dotenv(".env.local")

SCOPES = "playlist-read-private playlist-modify-public playlist-modify-private user-read-private"


def get_spotify_client() -> spotipy.Spotify:
    auth = SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:8888/callback"),
        scope=SCOPES,
    )
    token_info = auth.refresh_access_token(os.getenv("SPOTIFY_REFRESH_TOKEN"))
    return spotipy.Spotify(auth=token_info["access_token"])
