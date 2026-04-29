(function () {
  if (document.getElementById("spotify-agent-btn")) return;

  // --- Toggle button ---
  const btn = document.createElement("button");
  btn.id = "spotify-agent-btn";
  btn.title = "Spotify Agent";
  btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48
      10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>`;
  document.body.appendChild(btn);

  // --- Panel ---
  const panel = document.createElement("div");
  panel.id = "spotify-agent-panel";
  panel.classList.add("hidden");
  panel.innerHTML = `
    <div id="agent-header">
      <span>Spotify Agent</span>
      <button id="agent-close" title="Close">✕</button>
    </div>
    <div id="agent-messages"></div>
    <div id="agent-input-row">
      <input id="agent-input" type="text" placeholder="Ask anything about your music…" autocomplete="off" />
      <button id="agent-send" title="Send">
        <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  const messages = panel.querySelector("#agent-messages");
  const input = panel.querySelector("#agent-input");
  const sendBtn = panel.querySelector("#agent-send");

  // Persist history for the session
  let history = [];

  function addMessage(text, role) {
    const el = document.createElement("div");
    el.className = `agent-msg ${role}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;

    addMessage(text, "user");
    const thinking = addMessage("Thinking…", "thinking");

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "CHAT", message: text, history }, (res) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        });
      });

      thinking.remove();

      if (response.error) {
        addMessage("Something went wrong. Please try again.", "agent");
      } else {
        history = response.history;
        addMessage(response.reply, "agent");
      }
    } catch (err) {
      thinking.remove();
      addMessage("Could not reach the agent. Is the server running?", "agent");
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // --- Event listeners ---
  btn.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) input.focus();
  });

  panel.querySelector("#agent-close").addEventListener("click", () => {
    panel.classList.add("hidden");
  });

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
