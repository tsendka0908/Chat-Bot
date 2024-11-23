import { CONFIG } from "./config.js";
import { getMessageStructure, loadingStructure } from "./structure.js";

let isGeneratingResponse = false;

const form = document.querySelector("form");
const input = document.querySelector("input");
const header = document.querySelector("header");
const chatContainer = document.querySelector(".chat-container");
const scrollTarget = document.querySelector("#scroll-target");
const modeButton = document.querySelector("#mode");
const container = document.querySelector("#container");
const deleteButton = document.querySelector("#delete");

const API_KEY = CONFIG.API_KEY.join("");
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

document.addEventListener("DOMContentLoaded", () => {
    loadDataPromLocalStorage();
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message || isGeneratingResponse) return;
        sendmessage(message);
        setTimeout(respondLoadmessage, 500);
        const chatBotResponse = await generateResponse(message);
        typeChatResponse(chatBotResponse);
    });
});

const sendmessage = (message) => {
    isGeneratingResponse = true;
    header.classList.add("hide");
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = getMessageStructure(
        message,
        "./images/Natsuki_Subaru_Anime.webp"
    );
    chatContainer.appendChild(div);
    input.value = "";
    autoScroll();
};

const respondLoadmessage = () => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = loadingStructure;
    chatContainer.appendChild(div);
    autoScroll();
};

const generateResponse = async (message) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: message }],
                    },
                ],
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        return data?.candidates[0].content.parts[0].text.replace(
            /\*\*(.*?)\*\*/g,
            "$1"
        );
    } catch (error) {
        alert(error.message);
    } finally {
        isGeneratingResponse = false;
        chatContainer.removeChild(chatContainer.lastChild);
    }
};
const typeChatResponse = (chatBotResponse) => {
    const words = chatBotResponse.split(" ");
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = getMessageStructure("", "./images/gemini.svg", true);
    chatContainer.appendChild(div);

    const messageActions = div.querySelector("message-actions");
    const copyButton = div.querySelector(".copy");
    copyButton.addEventListener("click", (e) => {
        copyMessage(chatBotResponse, e.target);
    });

    const volumeUpButton = div.querySelector(".volume-up");
    volumeUpButton.addEventListener("click", (e) => {
        readMessage(chatBotResponse, e.target);
    });

    const textElement = div.querySelector("span");
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
        if (currentIndex === 0) {
            textElement.innerText += words[currentIndex];
        } else {
            textElement.innerText += " " + words[currentIndex];
        }
        currentIndex++;
        if (currentIndex === words.length) {
            clearInterval(typingInterval);
            isGeneratingResponse = false;
            setTimeout(() => messageActions.classList.remove("hide"), 200);
            localStorage.setItem("chat-history", chatContainer.innerHTML);
        }
        autoScroll();
    }, 75);
};

const autoScroll = () => scrollTarget.scrollIntoView({ behavior: "smooth" });

modeButton.addEventListener("click", () => {
    const isLightMode = container.classList.toggle("light-mode");
    container.classList.toggle("dark-mode", !isLightMode);

    modeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    localStorage.setItem("mode", isLightMode ? "light-mode" : "dark-mode");
});

const loadDataPromLocalStorage = () => {
    const savedChatHistory = localStorage.getItem("chat-history");
    const savedMode = localStorage.getItem("mode") || "light-mode";

    container.className = "";
    container.classList.add(savedMode);
    modeButton.innerText =
        savedMode === "light-mode" ? "dark_mode" : "light_mode";

    chatContainer.innerHTML = savedChatHistory || "";
    header.classList.toggle("hide", savedChatHistory);
    autoScroll();
};
deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure u want to delete all ur chats?")) {
        localStorage.removeItem("chat-history");
        loadDataPromLocalStorage();
    }
});

const copyMessage = (message, target) => {
    navigator.clipboard.writeText(message);
    target.innerText = "done";
    setTimeout(() => (target.innerText = "context_copy"), 1500);
};

const readMessage = (message, target) => {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        target.innerText = "volume_up";
    } else {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.onend = () => (target.innerText = "volume_up");

        window.speechSynthesis.speak(utterance);
        target.innerText = "volume_off";
    }
};
