import spotipy


def search_tracks(sp: spotipy.Spotify, query: str, limit: int = 5) -> list[dict]:
    results = sp.search(q=query, type="track", limit=limit)
    return [
        {
            "name": t["name"],
            "artist": t["artists"][0]["name"],
            "album": t["album"]["name"],
            "uri": t["uri"],
        }
        for t in results["tracks"]["items"]
    ]


def get_user_playlists(sp: spotipy.Spotify, limit: int = 20) -> list[dict]:
    results = sp.current_user_playlists(limit=limit)
    return [
        {
            "name": p["name"],
            "id": p["id"],
            "track_count": p.get("tracks", {}).get("total", 0),
        }
        for p in results["items"]
        if p is not None
    ]


def add_track_to_playlist(sp: spotipy.Spotify, track_uri: str, playlist_id: str) -> str:
    sp.playlist_add_items(playlist_id, [track_uri])
    return f"Added {track_uri} to playlist {playlist_id}."


def remove_track_from_playlist(sp: spotipy.Spotify, track_uri: str, playlist_id: str) -> str:
    sp.playlist_remove_all_occurrences_of_items(playlist_id, [track_uri])
    return f"Removed {track_uri} from playlist {playlist_id}."
