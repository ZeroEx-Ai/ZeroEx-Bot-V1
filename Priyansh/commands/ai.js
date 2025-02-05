const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "AI by Priyansh (Powered by Gemini)",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0",
        "fs": "latest",
        "path": "latest"
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let query = args.join(" ");
    const isImageReply = messageReply?.attachments && messageReply.attachments[0]?.type === 'image';

    if (isImageReply) {
        const imageUrl = messageReply.attachments[0]?.url;

        try {
            api.setMessageReaction("⌛", messageID, () => {}, true);
            api.sendMessage("🔍 Processing the image and your question...", threadID, messageID);

            // Download the image
            const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const base64Image = Buffer.from(imageResponse.data, "binary").toString("base64");

            // Fetch Gemini API
            const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json');
            const geminiAPI = apiList.data.gemini;

            // Send Image + Text Query to Gemini
            const response = await axios.post(`${geminiAPI}/gemini`, {
                modelType: "image_and_text",
                image: base64Image,  // Send image as base64
                prompt: query
            });

            const result = response.data?.result;

            if (result) {
                api.sendMessage(`🤖 AI Response based on the image and your query:\n\n${result}`, threadID, messageID);
                api.setMessageReaction("✅", messageID, () => {}, true);
            } else {
                throw new Error("No valid response from API");
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Failed to process the image. Make sure the API supports image input.", threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
        }
    } else {
        if (messageReply?.body) {
            query = messageReply.body + " " + query;
        }

        if (!query.trim()) return api.sendMessage("Please type your question...", threadID, messageID);

        try {
            api.setMessageReaction("⌛", messageID, () => {}, true);
            api.sendMessage("🔍 Searching for an answer...", threadID, messageID);

            const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json');
            const geminiAPI = apiList.data.gemini;

            const response = await axios.post(`${geminiAPI}/gemini`, {
                modelType: "text_only",
                prompt: query
            });

            const result = response.data?.result;

            if (result) {
                api.sendMessage(`🤖 Gemini's Response:\n\n${result}`, threadID, messageID);
                api.setMessageReaction("✅", messageID, () => {}, true);
            } else {
                throw new Error("No valid response from API");
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
        }
    }
};
