// BACKEND_URL is defined in config.js, but service workers can't share
// content script globals — so we redeclare it here.
const BACKEND_URL = "https://spotify-agent-eight.vercel.app";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "CHAT") return false;

  fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg.message, history: msg.history }),
  })
    .then((res) => res.json())
    .then((data) => sendResponse(data))
    .catch((err) => sendResponse({ error: err.message }));

  return true; // keep message channel open for async response
});
