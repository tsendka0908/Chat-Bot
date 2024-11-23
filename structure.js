import { copyIcon, volumeUpIcon } from "./icons.js";

export const getMessageStructure = (message, src, withActions) => {
    return `<div class="message-content">
                        <img src="${src}" alt="" />
                        <span>${message}</span>
                    </div>
                    <div class="message-actions ${withActions ? "" : "hide"}">
                        ${copyIcon}
                        ${volumeUpIcon}
                    </div>`;
};

export const loadingStructure = `<div class="message-content">
                        <img src="./images/gemini.svg" alt="" />
                    <div class="loading-indicator">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                    </div>
                </div>`;
