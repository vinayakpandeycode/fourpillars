document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  if (!chatMessages || !chatInput || !chatSend) {
    console.error("Chatbot elements not found.");
    return;
  }

  let conversation = [];

  function addMessage(text, type = "assistant") {
    const message = document.createElement("div");

    message.className =
      type === "user"
        ? "chat-message user-message"
        : "chat-message assistant-message";

    message.textContent = text;

    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");

    typing.id = "chatTyping";
    typing.className = "chat-message assistant-message";
    typing.textContent = "Thinking...";

    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById("chatTyping");

    if (typing) {
      typing.remove();
    }
  }

  function addWhatsAppButton() {
    const wrapper = document.createElement("div");

    wrapper.className = "chat-whatsapp-wrapper";

    wrapper.innerHTML = `
      <a
        href="https://wa.me/918828586487?text=Hello%20Four%20Pillars%2C%20I%20would%20like%20to%20discuss%20a%20business%20opportunity."
        target="_blank"
        rel="noopener noreferrer"
        class="chat-whatsapp-button"
      >
        Continue on WhatsApp
      </a>
    `;

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage() {
    const question = chatInput.value.trim();

    if (!question) return;

    addMessage(question, "user");

    chatInput.value = "";
    chatInput.disabled = true;
    chatSend.disabled = true;

    showTyping();

    try {
      console.log("Sending question to /api/chat:", question);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          question: question,
          conversation: conversation.slice(-10)
        })
      });

      console.log("API status:", response.status);

      const rawText = await response.text();

      console.log("API raw response:", rawText);

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned invalid JSON. Status: ${response.status}`
        );
      }

      removeTyping();

      if (!response.ok) {
        throw new Error(
          data.error ||
          `API request failed with status ${response.status}`
        );
      }

      if (!data.answer) {
        throw new Error("AI returned no answer.");
      }

      addMessage(data.answer, "assistant");

      conversation.push({
        role: "user",
        content: question
      });

      conversation.push({
        role: "assistant",
        content: data.answer
      });

      conversation = conversation.slice(-10);

      addWhatsAppButton();

    } catch (error) {
      console.error("FOUR PILLARS CHATBOT ERROR:", error);

      removeTyping();

      addMessage(
        "AI connection error: " + error.message,
        "assistant"
      );

      addWhatsAppButton();

    } finally {
      chatInput.disabled = false;
      chatSend.disabled = false;
      chatInput.focus();
    }
  }

  chatSend.addEventListener("click", sendMessage);

  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat-question]");

    if (!button) return;

    const question = button.getAttribute("data-chat-question");

    if (!question) return;

    chatInput.value = question;
    sendMessage();
  });

  if (!chatMessages.children.length) {
    addMessage(
      "Hello. Welcome to Four Pillars Business Services. I can help you with our services, markets, sectors and consultation process.",
      "assistant"
    );
  }

  console.log("Four Pillars AI Chatbot loaded successfully.");
});