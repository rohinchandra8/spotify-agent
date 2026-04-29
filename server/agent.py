import os
import anthropic
from dotenv import load_dotenv

from server.auth import get_spotify_client
from server.tools_schema import TOOLS
import server.spotify_tools as spotify_tools

load_dotenv(".env.local")

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a Spotify assistant. You help the user manage their Spotify library
using natural language. You can search for tracks, list playlists, add tracks to playlists,
and remove tracks from playlists.

When the user asks to add or remove a track, always confirm what you did in a friendly,
concise way. If a request is ambiguous (e.g. the user doesn't specify which playlist),
ask for clarification before calling any tools."""

TOOL_DISPATCH = {
    "search_tracks": lambda sp, inp: spotify_tools.search_tracks(sp, **inp),
    "get_user_playlists": lambda sp, inp: spotify_tools.get_user_playlists(sp, **inp),
    "add_track_to_playlist": lambda sp, inp: spotify_tools.add_track_to_playlist(sp, **inp),
    "remove_track_from_playlist": lambda sp, inp: spotify_tools.remove_track_from_playlist(sp, **inp),
}


def _serialize_content(content) -> list[dict]:
    """Convert Anthropic SDK content blocks to plain dicts for JSON serialization."""
    result = []
    for block in content:
        if block.type == "text":
            result.append({"type": "text", "text": block.text})
        elif block.type == "tool_use":
            result.append({"type": "tool_use", "id": block.id, "name": block.name, "input": block.input})
    return result


def chat(message: str, history: list) -> tuple[str, list]:
    sp = get_spotify_client()
    history = history + [{"role": "user", "content": message}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=history,
        )

        if response.stop_reason == "end_turn":
            reply = next(b.text for b in response.content if b.type == "text")
            history = history + [{"role": "assistant", "content": reply}]
            return reply, history

        # Handle tool calls
        serialized = _serialize_content(response.content)
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = TOOL_DISPATCH[block.name](sp, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })

        history = history + [
            {"role": "assistant", "content": serialized},
            {"role": "user", "content": tool_results},
        ]
