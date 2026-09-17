// ==========================================
// FOUR PILLARS AI CHATBOT
// chatbot.js
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  // Check required HTML elements
  if (!chatMessages || !chatInput || !chatSend) {
    console.error(
      "Four Pillars AI: Required chatbot elements were not found."
    );
    return;
  }

  // Conversation history
  let conversation = [];

  // ==========================================
  // ADD MESSAGE
  // ==========================================

  function addMessage(text, sender) {

    const message = document.createElement("div");

    message.className =
      sender === "user"
        ? "chat-message user-message"
        : "chat-message assistant-message";

    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return message;
  }

  // ==========================================
  // WHATSAPP BUTTON
  // ==========================================

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
  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async function sendMessage() {

    const question = chatInput.value.trim();

    if (!question) {
      return;
    }

    // Show user message
    addMessage(question, "user");

    // Clear input
    chatInput.value = "";

    // Disable controls
    chatInput.disabled = true;
    chatSend.disabled = true;

    // Show typing
    const typingMessage = addMessage(
      "Thinking...",
      "assistant"
    );

    try {

      console.log(
        "Four Pillars AI: Sending request..."
      );

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

      console.log(
        "Four Pillars AI API status:",
        response.status
      );

      // Read response
      const data = await response.json();

      // Remove typing message
      typingMessage.remove();

      // Check API response
      if (!response.ok) {

        console.error(
          "Four Pillars AI API error:",
          data
        );

        throw new Error(
          data.error ||
          "AI service is currently unavailable."
        );
      }

      // Get answer
      const answer =
        typeof data.answer === "string"
          ? data.answer.trim()
          : "";

      if (!answer) {

        throw new Error(
          "The AI returned an empty response."
        );
      }

      // Show AI answer
      addMessage(
        answer,
        "assistant"
      );

      // Save conversation
      conversation.push({

        role: "user",

        content: question

      });

      conversation.push({

        role: "assistant",

        content: answer

      });

      // Keep conversation small
      conversation =
        conversation.slice(-10);

      // WhatsApp option
      addWhatsAppButton();

    }

    catch (error) {

      console.error(
        "Four Pillars AI error:",
        error
      );

      // Remove typing
      if (typingMessage) {
        typingMessage.remove();
      }

      // Show friendly error
      addMessage(
        "I'm currently unable to connect to the AI assistant. Please contact info@fourpillars.co or continue on WhatsApp for assistance.",
        "assistant"
      );

      // WhatsApp option
      addWhatsAppButton();

    }

    finally {

      // Enable controls
      chatInput.disabled = false;

      chatSend.disabled = false;

      chatInput.focus();

    }

  }

  // ==========================================
  // SEND BUTTON
  // ==========================================

  chatSend.addEventListener(
    "click",
    sendMessage
  );

  // ==========================================
  // ENTER KEY
  // ==========================================

  chatInput.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

      }

    }
  );

  // ==========================================
  // QUICK QUESTIONS
  // ==========================================

  document.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-chat-question]"
        );

      if (!button) {
        return;
      }

      const question =
        button.getAttribute(
          "data-chat-question"
        );

      if (!question) {
        return;
      }

      chatInput.value = question;

      sendMessage();

    }
  );

  // ==========================================
  // WELCOME MESSAGE
  // ==========================================

  if (chatMessages.children.length === 0) {

    addMessage(
      "Hello. Welcome to Four Pillars Business Services. I can help you learn about our services, sectors, markets and consultation process.",
      "assistant"
    );

  }

  console.log(
    "Four Pillars AI Chatbot initialized successfully."
  );

});
