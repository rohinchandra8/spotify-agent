(function () {
  if (document.getElementById("spotify-agent-btn")) return;

  // --- Lightweight markdown renderer ---
  function renderMarkdown(text) {
    let html = text
      // Escape HTML to prevent XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Tables: match header | separator | rows
    html = html.replace(
      /((?:\|.+\|\n?)+)/g,
      (block) => {
        const rows = block.trim().split("\n").filter((r) => r.trim());
        if (rows.length < 2) return block;
        const isSep = (r) => /^\|[\s\-|:]+\|$/.test(r.trim());
        let out = "<table>";
        let inBody = false;
        rows.forEach((row, i) => {
          if (isSep(row)) { inBody = true; return; }
          const cells = row.split("|").slice(1, -1).map((c) => c.trim());
          const tag = (!inBody && i === 0) ? "th" : "td";
          out += `<tr>${cells.map((c) => `<${tag}>${c}</${tag}>`).join("")}</tr>`;
        });
        out += "</table>";
        return out;
      }
    );

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headers
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Unordered lists
    html = html.replace(/((?:^[-*] .+\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^[-*] /, "")}</li>`);
      return `<ul>${items.join("")}</ul>`;
    });

    // Ordered lists
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`);
      return `<ol>${items.join("")}</ol>`;
    });

    // Paragraphs: wrap double-newline separated blocks not already in a tag
    html = html
      .split(/\n{2,}/)
      .map((block) => {
        block = block.trim();
        if (!block) return "";
        if (/^<(table|ul|ol|h[1-3])/.test(block)) return block;
        return `<p>${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");

    return html;
  }

  // --- Toggle button (equalizer waveform icon) ---
  const btn = document.createElement("button");
  btn.id = "spotify-agent-btn";
  btn.title = "Spotify Agent";
  btn.innerHTML = `
    <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="10" width="3.5" height="12" rx="1.75" fill="#000"/>
      <rect x="7.5" y="5"  width="3.5" height="17" rx="1.75" fill="#000"/>
      <rect x="13" y="8"  width="3.5" height="14" rx="1.75" fill="#000"/>
      <rect x="18.5" y="2" width="3.5" height="20" rx="1.75" fill="#000"/>
      <circle cx="20" cy="7" r="4" fill="#1db954"/>
      <path d="M18.5 7l1 1 2-2" stroke="#000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  document.body.appendChild(btn);

  // --- Panel ---
  const panel = document.createElement("div");
  panel.id = "spotify-agent-panel";
  panel.classList.add("hidden");
  panel.innerHTML = `
    <div id="agent-header">
      <div id="agent-header-icon">
        <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2"  y="10" width="3.5" height="12" rx="1.75" fill="#fff"/>
          <rect x="7.5" y="5"  width="3.5" height="17" rx="1.75" fill="#fff"/>
          <rect x="13" y="8"  width="3.5" height="14" rx="1.75" fill="#fff"/>
          <rect x="18.5" y="2" width="3.5" height="20" rx="1.75" fill="#fff"/>
        </svg>
      </div>
      <div id="agent-header-title">
        <span>Spotify Agent</span>
        <small>AI-powered music assistant</small>
      </div>
      <button id="agent-close" title="Close">✕</button>
    </div>
    <div id="agent-messages"></div>
    <div id="agent-input-row">
      <input id="agent-input" type="text" placeholder="Search songs, manage playlists…" autocomplete="off" />
      <button id="agent-send" title="Send">
        <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  const messages = panel.querySelector("#agent-messages");
  const input = panel.querySelector("#agent-input");
  const sendBtn = panel.querySelector("#agent-send");

  let history = [];

  function addMessage(text, role) {
    const el = document.createElement("div");
    el.className = `agent-msg ${role}`;
    if (role === "agent") {
      el.innerHTML = renderMarkdown(text);
    } else {
      el.textContent = text;
    }
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
