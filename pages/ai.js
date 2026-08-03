/* ==========================================
   PRIMEAIHUB AI - FRONTEND CHAT CONTROLLER
========================================== */

const AI_URL = "https://primeaihub-ai.adityapatil-171296.workers.dev/chat";
const ROLE = document.body.dataset.role || "student";
const CHAT_STORAGE_KEY = document.body.dataset.storage || "primeai-chat";

const chatArea = document.getElementById("chatArea");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const attachBtn = document.getElementById("attachBtn");
const fileInput = document.getElementById("fileInput");
const voiceBtn = document.getElementById("voiceBtn");
const newChatBtn = document.getElementById("newChatBtn");
const typing = document.getElementById("typing");
const robot = document.querySelector(".robot-section");

let isSending = false;
let recognition = null;

if (window.marked) {
    marked.setOptions({ breaks: true, gfm: true });
}

/* ---------- Initialisation and events ---------- */

loadChat();
bindEvents();
setupSpeechRecognition();

function bindEvents() {
    sendBtn.addEventListener("click", sendMessage);
    attachBtn.addEventListener("click", () => fileInput.click());
    newChatBtn.addEventListener("click", startNewChat);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    fileInput.addEventListener("change", handleFileSelection);

    // Delegation keeps restored LocalStorage copy buttons working as well.
    chatArea.addEventListener("click", handleChatAction);
}

/* ---------- Sending and API ---------- */

async function sendMessage() {
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    sendBtn.disabled = true;
    input.value = "";
    addTextMessage("user", text);
    showTyping();
    robotThinking();

    try {
        const reply = await askAI(ROLE, text);
        addAIMessage(reply);
    } finally {
        hideTyping();
        robotIdle();
        isSending = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

async function askAI(role, message) {
    try {
        const response = await fetch(AI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
           body: JSON.stringify({

    role,
    message,
    attachment: selectedAttachment

})
        });

        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = await response.json();
        return data && data.success && typeof data.reply === "string"
            ? data.reply
            : "AI Error. Please try again.";
    } catch (error) {
        console.error("PrimeAiHub AI request failed:", error);
        return "Unable to connect. Please check your internet connection and try again.";
    }
}

/* ---------- Message creation and Markdown ---------- */

function addTextMessage(type, text) {
    const message = createMessageShell(type);
    const bubble = message.querySelector(".bubble");
    bubble.textContent = text;
    appendTime(bubble);
    appendMessage(message);
}

function addAIMessage(text) {
    const message = createMessageShell("ai");
    const bubble = message.querySelector(".bubble");
    const content = document.createElement("div");
    content.className = "message-content message-content--revealed";
    content.innerHTML = formatMessage(text);
    bubble.appendChild(content);
    bubble.appendChild(createCopyButton(text));
    appendTime(bubble);
    appendMessage(message);
}

function createMessageShell(type) {
    const message = document.createElement("div");
    message.className = `message ${type}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = type === "ai" ? "🤖" : "👤";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    message.append(avatar, bubble);
    return message;
}

function formatMessage(text) {
    const source = String(text || "");
    const html = window.marked ? marked.parse(source) : escapeHtml(source).replace(/\n/g, "<br>");
    return window.DOMPurify
        ? DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
        : html;
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}

function appendTime(bubble) {
    const time = document.createElement("div");
    time.className = "time";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    bubble.appendChild(time);
}

function appendMessage(message) {
    chatArea.appendChild(message);
    saveChat();
    scrollBottom();
}

/* ---------- Copy ---------- */

function createCopyButton(text) {
    const button = document.createElement("button");
    button.className = "copy-btn";
    button.type = "button";
    button.setAttribute("aria-label", "Copy AI response");
    button.dataset.copyText = text;
    button.innerHTML = '<i class="fa-regular fa-copy"></i>';
    return button;
}

async function handleChatAction(event) {
    const button = event.target.closest(".copy-btn");
    if (!button) return;

    try {
        await copyText(button.dataset.copyText || "");
        button.innerHTML = '<i class="fa-solid fa-check"></i>';
        window.setTimeout(() => {
            button.innerHTML = '<i class="fa-regular fa-copy"></i>';
        }, 1500);
    } catch (error) {
        console.error("Copy failed:", error);
    }
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
}

/* ---------- Typing and robot state ---------- */

function showTyping() {
    typing.style.display = "flex";
    typing.setAttribute("aria-hidden", "false");
    scrollBottom();
}

function hideTyping() {
    typing.style.display = "none";
    typing.setAttribute("aria-hidden", "true");
}

function robotThinking() {
    if (robot) robot.classList.add("thinking");
}

function robotIdle() {
    if (robot) robot.classList.remove("thinking");
}

function scrollBottom() {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
}

/* ---------- Speech recognition and speech output ---------- */

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceBtn.disabled = true;
        voiceBtn.title = "Voice input is not supported by this browser";
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.addEventListener("click", () => {
        try {
            recognition.start();
            voiceBtn.classList.add("recording");
        } catch (error) {
            // Calling start while recognition is already active is harmless.
            if (error.name !== "InvalidStateError") console.error("Voice input failed:", error);
        }
    });

    recognition.addEventListener("result", (event) => {
        input.value = event.results[0][0].transcript;
        input.focus();
    });
    recognition.addEventListener("end", () => voiceBtn.classList.remove("recording"));
    recognition.addEventListener("error", () => voiceBtn.classList.remove("recording"));
}

function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

/* ---------- Files ---------- */

function handleFileSelection() {

    const file = fileInput.files[0];

    if (!file) return;

    showFile(file);

    const reader = new FileReader();

    reader.onload = () => {

        selectedAttachment = {

            filename: file.name,
            mimeType: file.type,
            data: reader.result.split(",")[1]

        };

    };

    reader.readAsDataURL(file);

}

function showFile(file) {
    const message = createMessageShell("user");
    const bubble = message.querySelector(".bubble");
    const card = document.createElement("div");
    card.className = "file-card";

    const icon = document.createElement("div");
    icon.className = "file-icon";
    icon.textContent = file.type.startsWith("image/") ? "🖼️" : "📄";

    const info = document.createElement("div");
    info.className = "file-info";
    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;
    const size = document.createElement("div");
    size.className = "file-size";
    size.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    info.append(name, size);
    card.append(icon, info);
    bubble.appendChild(card);

    if (file.type.startsWith("image/")) {
        const preview = document.createElement("img");
        preview.className = "file-preview";
        preview.alt = file.name;
        preview.src = URL.createObjectURL(file);
        bubble.appendChild(preview);
    }

    appendTime(bubble);
    appendMessage(message);
}

/* ---------- Chat history ---------- */

function saveChat() {
    try {
        localStorage.setItem(CHAT_STORAGE_KEY, chatArea.innerHTML);
    } catch (error) {
        console.error("Unable to save chat history:", error);
    }
}

function loadChat() {
    try {
        const history = localStorage.getItem(CHAT_STORAGE_KEY);
        if (history) {
            chatArea.innerHTML = DOMPurify ? DOMPurify.sanitize(history, { USE_PROFILES: { html: true } }) : history;
            scrollBottom();
        }
    } catch (error) {
        console.error("Unable to load chat history:", error);
    }
}

function startNewChat() {

    if (!confirm("Start a new chat?")) return;

    localStorage.removeItem(CHAT_STORAGE_KEY);

    chatArea.innerHTML = `
        <div class="message ai">
            <div class="avatar">🤖</div>
            <div class="bubble">
                Hello! What would you like to learn today?
            </div>
        </div>
    `;

    input.value = "";
    scrollBottom();

}

window.addEventListener("load",()=>{

    setTimeout(()=>{

        document
            .getElementById("loadingScreen")
            .classList.add("hide");

    },5000);

});

/* ==========================================
   AI ATTACHMENT SUPPORT
   APPEND ONLY
========================================== */

let selectedAttachment = null;


fileInput.addEventListener("change", async () => {

    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        selectedAttachment = {

            filename: file.name,

            mimeType: file.type,

            data: reader.result.split(",")[1]

        };

        showToast("📎 " + file.name + " attached");

    };

    reader.readAsDataURL(file);

});
