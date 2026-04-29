TOOLS = [
    {
        "name": "search_tracks",
        "description": (
            "Search Spotify for tracks matching a query. Use this to find track URIs "
            "before adding or removing tracks, or when the user asks to search for music."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query, e.g. 'Creep Radiohead' or 'lo-fi beats'",
                },
                "limit": {
                    "type": "integer",
                    "description": "Number of results to return (default 5, max 10)",
                    "default": 5,
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_user_playlists",
        "description": (
            "Get the current user's Spotify playlists. Use this to find a playlist ID "
            "before adding or removing tracks, or when the user asks to see their playlists."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "Number of playlists to return (default 20)",
                    "default": 20,
                },
            },
            "required": [],
        },
    },
    {
        "name": "add_track_to_playlist",
        "description": (
            "Add a track to a playlist. Requires the track URI and playlist ID — "
            "call search_tracks and get_user_playlists first if you don't have them."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "track_uri": {
                    "type": "string",
                    "description": "Spotify track URI, e.g. 'spotify:track:abc123'",
                },
                "playlist_id": {
                    "type": "string",
                    "description": "Spotify playlist ID",
                },
            },
            "required": ["track_uri", "playlist_id"],
        },
    },
    {
        "name": "remove_track_from_playlist",
        "description": (
            "Remove a track from a playlist. Requires the track URI and playlist ID — "
            "call search_tracks and get_user_playlists first if you don't have them."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "track_uri": {
                    "type": "string",
                    "description": "Spotify track URI, e.g. 'spotify:track:abc123'",
                },
                "playlist_id": {
                    "type": "string",
                    "description": "Spotify playlist ID",
                },
            },
            "required": ["track_uri", "playlist_id"],
        },
    },
]
