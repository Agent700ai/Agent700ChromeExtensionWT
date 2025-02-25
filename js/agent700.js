class ChatBot {
  constructor() {
    this.main = document.querySelector(".agent700-chat");
    this.chatBox = this.main.querySelector(".agent-chat-content");
    this.agent700ChatContainer = this.main.querySelector(".agent700-container");
    this.chatInputMsg = this.main.querySelector("#chatInputMsg");
    this.agentSendBtn = this.main.querySelector("#agentSendBtn");
    this.agentChatFields = this.main.querySelector("#agentChatFields");
    this.agentStatusText = this.main.querySelector("#agent-header-status .agent-header-status-text");
    this.chatCloseBtn = this.main.querySelector(".agent700-close");
    this.chatExpandBtn = this.main.querySelector(".agent700-expand-contract");
    this.chatOverlay = this.main.querySelector(".agent700-overlay");
    this.buttonShortcode = document.querySelectorAll(".chat-agent-shortcode-button");
    this.chatIcon = document.querySelector(".chat-agent-icon");

    //values
    this.agentId = "";
    this.apiUrl = "https://app.agent700.ai/api/chat";
    this.isVisible = true;
    this.overlayOption = "show";
    this.layout_type = "aside";

    // Initialize conversation history
    this.conversationHistory = [
      {
        role: "system",
        content: "",
      },
    ];

    // Ensure input and send button states are initialized
    if (this.chatInputMsg) {
      this.toggleagentSendBtn();
      this.chatInputMsg.addEventListener("input", () =>
        this.toggleagentSendBtn()
      );
    }

    if (this.chatIcon || this.buttonShortcode.length >= 1) {
      this.chatExpandBtn.addEventListener("click", () =>
        this.expandContractChat()
      );

      this.chatCloseBtn.addEventListener(
        "click",
        () => (this.showChat = !this.isVisible)
      );

      this.chatOverlay.addEventListener(
        "click",
        () => (this.showChat = !this.isVisible)
      );

      if (this.chatIcon) {
        this.chatIcon.addEventListener(
          "click",
          () => (this.showChat = !this.isVisible)
        );
      }

      if (this.buttonShortcode.length >= 1) {
        this.buttonShortcode.forEach((element) => {
          element.addEventListener(
            "click",
            () => (this.showChat = !this.isVisible)
          );
        });
      }
    }
    this.addActions();
    this.welcomeMessage();
  }

  //Get welcome message
  welcomeMessage() {
    fetch("https://agent700.ai/api/agents/" + this.agentId)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        let introductoryText = data?.revisions[0]?.introductoryText;

        if (introductoryText && introductoryText != "") {
          this.displayBotResponseTypingEffect(
            data.revisions[0].introductoryText
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  expandContractChat() {
    this.agent700ChatContainer.classList.toggle("expanded");
  }

  set showChat(value) {
    this.isVisible = value;

    if (value) {
      this.main.classList.add("show");

      if (
        this.overlayOption === "" ||
        (this.overlayOption === "1" && this.layout_type === "aside")
      ) {
        document.body.style.overflow = "hidden";
      }

      this.chatInputMsg.focus();
    } else {
      this.main.classList.remove("show");
      document.body.style.overflow = "auto";
    }
  }

  getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  async postRequest() {
    this.agentStatusText.textContent = "Typing ...";
    const requestData = {
      agentId: this.agentId,
      messages: this.conversationHistory,
    };

    try {
      this.toggleInputDisabled(true);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      this.displayBotResponseTypingEffect(
        result.response || "No response received"
      );

      // Add bot response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: result.response || "No response received",
      });
    } catch (error) {
      console.error("Request error:", error);
    }
  }

  toggleInputDisabled(disable) {
    if (this.chatInputMsg) {
      if (disable) {
        this.chatInputMsg.classList.add("disabled");
        this.chatInputMsg.disabled = true;
      } else {
        this.chatInputMsg.classList.remove("disabled");
        this.chatInputMsg.disabled = false;
        this.chatInputMsg.focus();
      }
    }
  }

  toggleagentSendBtn() {
    if (this.chatInputMsg) {
      if (this.chatInputMsg.value.trim()) {
        this.agentSendBtn.classList.remove("disabled");
        this.agentSendBtn.disabled = false;
      } else {
        this.agentSendBtn.classList.add("disabled");
        this.agentSendBtn.disabled = true;
      }
    }
  }

  displayUserMessage(message) {
    const userMessage = document.createElement("div");
    userMessage.className = "userMessage";

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;
    userMessage.appendChild(messageSpan);

    const timestampSpan = document.createElement("span");
    timestampSpan.className = "timestamp";
    timestampSpan.textContent = this.getCurrentTime();
    userMessage.appendChild(timestampSpan);

    this.chatBox.appendChild(userMessage);
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  displayBotResponseTypingEffect(response) {
    const botResponse = document.createElement("div");
    botResponse.className = "botResponse";

    const messageSpan = document.createElement("span");
    botResponse.appendChild(messageSpan);

    const timestampSpan = document.createElement("span");
    timestampSpan.className = "timestamp";
    timestampSpan.textContent = this.getCurrentTime();
    botResponse.appendChild(timestampSpan);

    this.chatBox.appendChild(botResponse);
    this.chatBox.scrollTop = this.chatBox.scrollHeight;

    // Convert Markdown to sanitized HTML
    const safeHTML = DOMPurify.sanitize(marked.parse(response));

    // Create a temporary container to parse the HTML structure
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = safeHTML;

    const nodes = Array.from(tempDiv.childNodes);
    let currentNodeIndex = 0;
    const typingSpeed = 20;

    const self = this;

    function typeText(node, parentElement, callback) {
      const textContent = node.textContent;
      let charIndex = 0;
      const textNode = document.createTextNode("");
      parentElement.appendChild(textNode);

      function typeChar() {
        if (charIndex < textContent.length) {
          textNode.textContent += textContent[charIndex];
          self.chatBox.scrollTop = self.chatBox.scrollHeight;
          charIndex++;
          setTimeout(typeChar, typingSpeed);
        } else {
          callback();
        }
      }

      typeChar();
    }

    function typeNode(node, parentElement, callback) {
      if (node.nodeType === Node.TEXT_NODE) {
        typeText(node, parentElement, callback);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node.cloneNode(false);
        parentElement.appendChild(element);

        const childNodes = Array.from(node.childNodes);
        let childIndex = 0;

        function typeNextChild() {
          if (childIndex < childNodes.length) {
            typeNode(childNodes[childIndex], element, typeNextChild);
            childIndex++;
          } else {
            callback();
          }
        }

        typeNextChild();
      } else {
        callback();
      }
    }

    function typeNextNode() {
      if (currentNodeIndex < nodes.length) {
        const currentNode = nodes[currentNodeIndex];
        currentNodeIndex++;
        typeNode(currentNode, messageSpan, typeNextNode);
      } else {
        self.agentStatusText.textContent = "Online";
        self.toggleInputDisabled(false);
      }
    }
    typeNextNode();
  }

  addActions() {
    if (this.agentSendBtn && this.chatInputMsg) {
      this.agentSendBtn.addEventListener("click", () => {
        this.handleSendMessage();
      });

      this.chatInputMsg.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          if (event.shiftKey) {
            event.preventDefault();
            this.chatInputMsg.value += "\n";
          } else {
            event.preventDefault();
            this.handleSendMessage();
          }
        }
      });
    }
  }

  handleSendMessage() {
    if (this.chatInputMsg) {
      const userInput = this.chatInputMsg.value.trim();
      if (userInput) {
        // Add user message to conversation history
        this.conversationHistory.push({
          role: "user",
          content: userInput,
        });

        this.displayUserMessage(userInput);
        this.postRequest();
        this.chatInputMsg.value = "";
        this.toggleagentSendBtn();
      }
    }
  }
}

class InitValidations {
  constructor() {
    this.agentIdInput = document.getElementById("agentId");
    this.saveButton = document.getElementById("save");
    this.configScreen = document.querySelector(".chat-config");
    this.chatTemplate = document.querySelector(".agent700-chat");
    this.agentError = document.querySelector(".error");
    this.initializingMessage = document.querySelector(".initializing");
    this.agentConfig = document.querySelector(".config-agent");
    this.agentConfigCancel = document.getElementById("cancel");

    //initialize validation checks
    this.checkStoredAgentId();
    this.addEventListeners();
  }

  //check if an Agent ID is already stored
  checkStoredAgentId() {
    chrome?.storage?.local?.get("agentId", (data) => {
      if (data.agentId) {
        this.showConfigurationCancel();
        this.showChatTemplate();
        new ChatBot();
      } else {
        this.showConfigScreen();
      }
    });
  }

  checkStoredAgentIdCancel() {
    chrome?.storage?.local?.get("agentId", (data) => {
      if (data.agentId) {
        this.showConfigurationCancel();
      }
    });
  }

  //validate Agent ID
  async validateAgentId(agentId) {
    try {
      const response = await fetch(`https://agent700.ai/api/agents/${agentId}`);

      if (!response.ok) {
        this.showError("Invalid Agent ID. Please try again.");
        return false;
      }

      return true;
    } catch (error) {
      this.showError("Network error. Please check your connection.");
      return false;
    }
  }

  //save Agent ID if valid
  async saveAgentId() {
    const agentId = this.agentIdInput.value.trim();

    if (!agentId) {
      this.showError("Agent ID cannot be empty.");
      return;
    }

    //validate Agent ID before saving
    const isValid = await this.validateAgentId(agentId);
    if (isValid) {
      this.hideError();

      chrome.storage.local.set({ agentId: agentId }, () => {
        this.showInitializingMessage();
      });
    }
  }

  addEventListeners() {
    this.saveButton.addEventListener("click", () => this.saveAgentId());
    this.agentConfig.addEventListener("click", () => {
      this.checkStoredAgentIdCancel();
      this.showConfigScreen();
    });
    this.agentConfigCancel.addEventListener("click", () => this.showChatTemplate());
  }

  //show chat screen
  showChatTemplate() {
    this.chatTemplate.classList.remove("hide");
    this.configScreen.classList.add("hide");
    this.hideError();
  }

  //show configuration screen
  showConfigScreen() {
    this.configScreen.classList.remove("hide");
    this.chatTemplate.classList.add("hide");
  }

  //show cancel configuration btn
  showConfigurationCancel() {
    this.agentConfigCancel.classList.remove("hide");
  }

  //show error message
  showError(message) {
    this.agentError.textContent = message;
    this.agentError.classList.remove("hide");
  }

  //hide the error message
  hideError() {
    this.agentError.classList.add("hide");
  }

  //clear chat content
  clearChatContent() {
    this.agentChatContent = document.querySelector(".agent-chat-content");
    this.agentChatContent.innerHTML = "";
  }

  //show the initializing message
  showInitializingMessage() {
    this.initializingMessage.classList.remove("hide", "fade-out");
    this.initializingMessage.classList.add("blinking");

    setTimeout(() => {
      this.initializingMessage.classList.remove("blinking");
      this.initializingMessage.classList.add("fade-out");

      setTimeout(() => {
        this.initializingMessage.classList.add("hide");
        this.clearChatContent();
        this.showChatTemplate();
        new ChatBot();
      }, 1000);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new InitValidations();
});
