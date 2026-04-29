"""
Run this once locally to get your Spotify refresh token.
Copy the printed refresh token into .env.local and Vercel env vars.

Usage:
    python scripts/get_refresh_token.py
"""
import os
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

load_dotenv(".env.local")

SCOPES = "playlist-read-private playlist-modify-public playlist-modify-private user-read-private"

auth = SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI", "http://127.0.0.1:8888/callback"),
    scope=SCOPES,
    cache_path=".cache",
)

token_info = auth.get_access_token(as_dict=True)

print("\n--- Copy this into .env.local and Vercel env vars ---")
print(f"SPOTIFY_REFRESH_TOKEN={token_info['refresh_token']}")
