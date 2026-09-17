
// ==========================================
// FOUR PILLARS AI CHATBOT
// chatbot.js
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

  // ==========================================
  // CHAT ELEMENTS
  // ==========================================

  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  if (!chatMessages || !chatInput || !chatSend) {
    console.error(
      "Four Pillars AI: Required chatbot elements were not found."
    );
    return;
  }

  // ==========================================
  // CONVERSATION HISTORY
  // ==========================================

  let conversation = [];

  // ==========================================
  // WHATSAPP CONFIGURATION
  // ==========================================

  // IMPORTANT:
  // ONLY DIGITS.
  // NO + SIGN
  // NO SPACES
  // NO HYPHENS

  const WHATSAPP_NUMBER = "918828586487";

  const WHATSAPP_MESSAGE =
    "Hello Four Pillars, I would like to discuss a business opportunity.";

  const WHATSAPP_URL =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(WHATSAPP_MESSAGE);

  // ==========================================
  // ADD CHAT MESSAGE
  // ==========================================

  function addMessage(text, sender) {

    const message = document.createElement("div");

    if (sender === "user") {
      message.className =
        "chat-message user-message user";
    } else {
      message.className =
        "chat-message assistant-message bot";
    }

    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
      chatMessages.scrollHeight;

    return message;
  }

  // ==========================================
  // ADD WHATSAPP BUTTON
  // ==========================================

  function addWhatsAppButton() {

    // Prevent duplicate WhatsApp buttons

    const existingButton =
      chatMessages.querySelector(
        ".chat-whatsapp-wrapper"
      );

    if (existingButton) {
      return;
    }

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "chat-whatsapp-wrapper";

    const button =
      document.createElement("a");

    button.href =
      WHATSAPP_URL;

    button.target =
      "_blank";

    button.rel =
      "noopener noreferrer";

    button.className =
      "chat-whatsapp-button";

    button.textContent =
      "Continue on WhatsApp";

    wrapper.appendChild(button);

    chatMessages.appendChild(wrapper);

    chatMessages.scrollTop =
      chatMessages.scrollHeight;
  }

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async function sendMessage() {

    const question =
      chatInput.value.trim();

    if (!question) {
      return;
    }

    // Prevent multiple requests

    if (
      chatInput.disabled ||
      chatSend.disabled
    ) {
      return;
    }

    // ========================================
    // SHOW USER MESSAGE
    // ========================================

    addMessage(
      question,
      "user"
    );

    // Clear input

    chatInput.value = "";

    // Disable controls

    chatInput.disabled = true;
    chatSend.disabled = true;

    // ========================================
    // SHOW THINKING MESSAGE
    // ========================================

    const typingMessage =
      addMessage(
        "Thinking...",
        "assistant"
      );

    try {

      console.log(
        "Four Pillars AI: Sending request..."
      );

      // ======================================
      // CALL BACKEND
      // ======================================

      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            body: JSON.stringify({

              question:
                question,

              conversation:
                conversation.slice(-10)

            })
          }
        );

      console.log(
        "Four Pillars AI API status:",
        response.status
      );

      // ======================================
      // READ RESPONSE
      // ======================================

      let data;

      try {

        data =
          await response.json();

      } catch (jsonError) {

        console.error(
          "Invalid JSON response:",
          jsonError
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      // Remove thinking message

      if (typingMessage) {
        typingMessage.remove();
      }

      // ======================================
      // API ERROR
      // ======================================

      if (!response.ok) {

        console.error(
          "Four Pillars AI API Error:",
          data
        );

        throw new Error(
          data?.error ||
          "AI service is currently unavailable."
        );
      }

      // ======================================
      // GET AI ANSWER
      // ======================================

      const answer =
        typeof data.answer === "string"
          ? data.answer.trim()
          : "";

      if (!answer) {

        console.error(
          "Empty AI response:",
          data
        );

        throw new Error(
          "AI returned an empty response."
        );
      }

      // ======================================
      // DISPLAY AI ANSWER
      // ======================================

      addMessage(
        answer,
        "assistant"
      );

      // ======================================
      // SAVE CONVERSATION
      // ======================================

      conversation.push({
        role: "user",
        content: question
      });

      conversation.push({
        role: "assistant",
        content: answer
      });

      // Keep latest 10 messages

      conversation =
        conversation.slice(-10);

      // ======================================
      // WHATSAPP OPTION
      // ======================================

      addWhatsAppButton();

    }

    catch (error) {

      console.error(
        "Four Pillars AI Chatbot Error:",
        error
      );

      // Remove thinking message

      if (typingMessage) {
        typingMessage.remove();
      }

      // ======================================
      // ERROR MESSAGE
      // ======================================

      addMessage(
        "I'm currently unable to connect to the AI assistant. Please contact info@fourpillars.co or continue on WhatsApp for assistance.",
        "assistant"
      );

      // WhatsApp fallback

      addWhatsAppButton();

    }

    finally {

      // Re-enable controls

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
    function () {
      sendMessage();
    }
  );

  // ==========================================
  // ENTER KEY
  // ==========================================

  chatInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

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

      if (
        chatInput.disabled
      ) {
        return;
      }

      chatInput.value =
        question;

      sendMessage();
    }
  );

  // ==========================================
  // WELCOME MESSAGE
  // ==========================================

  if (
    chatMessages.children.length === 0
  ) {

    addMessage(
      "Hello. Welcome to Four Pillars Business Services. I can help you learn about our services, sectors, markets and consultation process.",
      "assistant"
    );
  }

  // ==========================================
  // DEBUG
  // ==========================================

  console.log(
    "Four Pillars AI Chatbot initialized."
  );

  console.log(
    "WhatsApp number:",
    WHATSAPP_NUMBER
  );

  console.log(
    "WhatsApp URL:",
    WHATSAPP_URL
  );

});