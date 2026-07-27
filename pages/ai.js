/* ==========================================
   PRIMEAIHUB AI
========================================== */

const AI_URL =
"https://primeaihub-ai.adityapatil-171296.workers.dev/chat";

const ROLE = "student";

/* ==========================================
ELEMENTS
========================================== */

const chatArea =
document.getElementById("chatArea");

const input =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

const attachBtn =
document.getElementById("attachBtn");

const fileInput =
document.getElementById("fileInput");

const typing =
document.getElementById("typing");

/* ==========================================
SEND BUTTON
========================================== */

sendBtn.addEventListener(
"click",
sendMessage
);

attachBtn.addEventListener(
"click",
()=>{

fileInput.click();

});

input.addEventListener(
"keypress",
e=>{

if(e.key==="Enter"){

e.preventDefault();

sendMessage();

}

});

/* ==========================================
SEND
========================================== */

async function sendMessage(){

const text =
input.value.trim();

if(!text) return;

addMessage(
"text",
text
);

input.value="";

showTyping();

const reply =
await askAI(
ROLE,
text
);

hideTyping();

await addAIMessage(reply);

}

/* ==========================================
CALL AI
========================================== */

async function askAI(role,message){

try{

const response =
await fetch(AI_URL,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

role,
message

})

});

const data =
await response.json();

if(!data.success){

return "AI Error.";

}

return data.reply;

}

catch(error){

console.error(error);

return "Unable to connect.";

}

}

/* ==========================================
CHAT BUBBLES
========================================== */

function addMessage(type, text) {

    const message = document.createElement("div");
    message.className = `message ${type}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    if (type === "ai") {

        avatar.innerHTML = "🤖";

    } else {

        avatar.innerHTML = "👤";

    }

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    bubble.innerHTML = formatMessage(text);

    const time = document.createElement("div");
    time.className = "time";

    const now = new Date();

    time.textContent =
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    bubble.appendChild(time);

    message.appendChild(avatar);
    message.appendChild(bubble);

    chatArea.appendChild(message);

    scrollBottom();

}

/* ==========================================
FORMAT MESSAGE
========================================== */

function formatMessage(text) {

    return DOMPurify.sanitize(
        marked.parse(text)
    );

}
/* ==========================================
AUTO SCROLL
========================================== */

function scrollBottom() {

    chatArea.scrollTo({

        top: chatArea.scrollHeight,

        behavior: "smooth"

    });

}

/* ==========================================
TYPING
========================================== */

function showTyping() {

    typing.style.display = "flex";

    scrollBottom();

}

function hideTyping() {

    typing.style.display = "none";

}

/* ==========================================
PREMIUM AI TYPING EFFECT
========================================== */

async function typeMessage(element, html) {

    element.innerHTML = html;

    chatArea.scrollTop = chatArea.scrollHeight;

}

}

/* ==========================================
COPY BUTTON
========================================== */

function createCopyButton(text) {

    const btn = document.createElement("button");

    btn.className = "copy-btn";

    btn.innerHTML =
    '<i class="fa-regular fa-copy"></i>';

    btn.onclick = async () => {

        await navigator.clipboard.writeText(text);

        btn.innerHTML =
        '<i class="fa-solid fa-check"></i>';

        setTimeout(() => {

            btn.innerHTML =
            '<i class="fa-regular fa-copy"></i>';

        },1500);

    };

    return btn;

}

/* ==========================================
MARKDOWN
========================================== */

function formatMessage(text){

    text = text

    .replace(/^### (.*)$/gm,"<h3>$1</h3>")

    .replace(/^## (.*)$/gm,"<h2>$1</h2>")

    .replace(/^# (.*)$/gm,"<h1>$1</h1>")

    .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")

    .replace(/\*(.*?)\*/g,"<em>$1</em>")

    .replace(/`([^`]+)`/g,"<code>$1</code>")

    .replace(/\n/g,"<br>");

    return text;

}

/* ==========================================
NEW AI MESSAGE
========================================== */

async function addAIMessage(text){

    const message =
    document.createElement("div");

    message.className =
    "message ai";

    const avatar =
    document.createElement("div");

    avatar.className =
    "avatar";

    avatar.innerHTML="🤖";

    const bubble =
    document.createElement("div");

    bubble.className=
    "bubble";

    const content =
    document.createElement("div");

    bubble.appendChild(content);

    const copy =
    createCopyButton(text);

    bubble.appendChild(copy);

    message.appendChild(avatar);

    message.appendChild(bubble);

    chatArea.appendChild(message);

    scrollBottom();

    await typeMessage(
        content,
        formatMessage(text)
    );

}

/* ==========================================
   PRIMEAIHUB AI PREMIUM FEATURES
========================================== */

/* ==========================
   SPEECH TO TEXT
========================== */

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

}

const voiceBtn =
document.getElementById("voiceBtn");

if (voiceBtn && recognition) {

    voiceBtn.addEventListener("click", () => {

        recognition.start();

        voiceBtn.classList.add("recording");

    });

    recognition.onresult = (event) => {

        input.value =
        event.results[0][0].transcript;

    };

    recognition.onend = () => {

        voiceBtn.classList.remove("recording");

    };

}

/* ==========================
   TEXT TO SPEECH
========================== */

function speak(text){

    if(!("speechSynthesis" in window))
    return;

    speechSynthesis.cancel();

    const speech =
    new SpeechSynthesisUtterance(text);

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    speech.lang = "en-US";

    speechSynthesis.speak(speech);

}

/* ==========================
   SAVE CHAT
========================== */

function saveChat(){

    localStorage.setItem(

        "primeai-chat",

        chatArea.innerHTML

    );

}

/* ==========================
   LOAD CHAT
========================== */

function loadChat(){

    const history =
    localStorage.getItem(
    "primeai-chat"
    );

    if(history){

        chatArea.innerHTML =
        history;

        scrollBottom();

    }

}

window.addEventListener(
"load",
loadChat
);

/* ==========================
   AUTO SAVE
========================== */

const observer =
new MutationObserver(()=>{

    saveChat();

});

observer.observe(chatArea, {
    childList: true,
    subtree: true
});

/* ==========================
   ROBOT THINKING
========================== */

const robot =
document.querySelector(
".robot-section"
);

function robotThinking(){

    if(robot){

        robot.classList.add(
        "thinking"
        );

    }

}

function robotIdle(){

    if(robot){

        robot.classList.remove(
        "thinking"
        );

    }

}

/* ==========================
   MODIFY SEND
========================== */

const oldSend =
sendMessage;

sendMessage = async function(){

const text =
input.value.trim();

if(!text)
return;

robotThinking();

await oldSend();

robotIdle();

}

/* ==========================
   PLAY SOUND
========================== */

function playPop(){

const audio =
new Audio(
"https://actions.google.com/sounds/v1/cartoon/pop.ogg"
);

audio.volume=.3;

audio.play();

}

/* ==========================================
FILE UPLOAD
========================================== */

fileInput.addEventListener(
"change",
()=>{

const file =
fileInput.files[0];

if(!file)
return;

showFile(file);

});

function showFile(file){

const message =
document.createElement("div");

message.className =
"message user";

const avatar =
document.createElement("div");

avatar.className =
"avatar";

avatar.innerHTML="👤";

const bubble =
document.createElement("div");

bubble.className=
"bubble";

const card =
document.createElement("div");

card.className=
"file-card";

const icon =
document.createElement("div");

icon.className=
"file-icon";

if(file.type.includes("image")){

icon.innerHTML="🖼️";

}else{

icon.innerHTML="📄";

}

const info =
document.createElement("div");

info.className=
"file-info";

info.innerHTML=

`
<div class="file-name">

${file.name}

</div>

<div class="file-size">

${(file.size/1024/1024).toFixed(2)} MB

</div>

`;

card.appendChild(icon);

card.appendChild(info);

bubble.appendChild(card);

if(file.type.startsWith("image/")){

const img =
document.createElement("img");

img.className=
"file-preview";

img.src=
URL.createObjectURL(file);

bubble.appendChild(img);

}

message.appendChild(avatar);

message.appendChild(bubble);

chatArea.appendChild(message);

scrollBottom();

}
