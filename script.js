const API_KEY = "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"; // paste your new key here after regenerating

const SYSTEM_PROMPT = `You are ShopAssist AI, a friendly and efficient customer support bot for ShopZone, an online e-commerce store.

You help customers with:
- Order tracking (ask for order ID, then confirm it is in transit with a realistic fake ETA)
- Returns and refunds (7-day return policy, free returns for all orders)
- Payment methods (credit/debit cards, UPI, wallets, cash on delivery)
- Product availability and recommendations
- Account issues and password resets

Rules:
- Be warm, concise, and helpful. Use bullet points when listing steps.
- If the user asks to speak to a human or types "agent", respond exactly: "Connecting you to a live support agent now. Your ticket number is #TKT-XXXXX. Average wait time: 3 minutes." (replace XXXXX with a random 5-digit number)
- Never make up real product prices. Use placeholder values like ₹999 or ₹1,499.
- Always end responses with: "Is there anything else I can help you with? 😊"`;

let messages = [];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMessage(text, role) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const av = document.createElement("div");
  av.className = `row-avatar ${role === "user" ? "user-av" : ""}`;
  av.textContent = role === "user" ? "👤" : "🛒";

  const col = document.createElement("div");

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role === "user" ? "user-bubble" : "bot-bubble"}`;
  bubble.textContent = text;

  const ts = document.createElement("div");
  ts.className = "timestamp";
  ts.textContent = getTime();

  col.appendChild(bubble);
  col.appendChild(ts);

  row.appendChild(av);
  row.appendChild(col);

  document.getElementById("chat-body").appendChild(row);
  document.getElementById("chat-body").scrollTop = 9999;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "message-row bot";
  row.id = "typing-row";

  const av = document.createElement("div");
  av.className = "row-avatar";
  av.textContent = "🛒";

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";

  row.appendChild(av);
  row.appendChild(typing);

  document.getElementById("chat-body").appendChild(row);
  document.getElementById("chat-body").scrollTop = 9999;
}

function removeTyping() {
  const el = document.getElementById("typing-row");
  if (el) el.remove();
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  input.disabled = true;

  addMessage(text, "user");
  messages.push({ role: "user", content: text });
  showTyping();

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    const data = await res.json();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      messages.push({ role: "assistant", content: reply });
      removeTyping();
      addMessage(reply, "bot");
    } else {
      throw new Error("No response from API");
    }

  } catch (e) {
    removeTyping();
    addMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.", "bot");
    console.error(e);
  }

  input.disabled = false;
  input.focus();
}

function quickReply(text) {
  document.getElementById("user-input").value = text;
  sendMessage();
}

window.onload = () => {
  addMessage("Hi there! 👋 I'm ShopAssist AI, your personal shopping support assistant. How can I help you today?", "bot");
};