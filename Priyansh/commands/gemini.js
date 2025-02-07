const axios = require("axios");

module.exports.config = {
    name: "gemini",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Chat with Gemini AI",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 5,
    dependencies: { "axios": "1.4.0" }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let query = args.join(" ");
    
    // Jodi kono message er reply te use kora hoy
    if (messageReply?.body) {
        query = messageReply.body + " " + query;
    }

    if (!query.trim()) return api.sendMessage("❌ Please type your question...", threadID, messageID);

    let config = { modelType: 'text_only', prompt: query };

    // If replied message has an image, send it along
    if (messageReply?.attachments?.length > 0) {
        const attachment = messageReply.attachments[0];
        config = { 
            modelType: 'text_and_image', 
            prompt: query, 
            imageParts: [attachment.url] 
        };
    }

    try {
        api.setMessageReaction("⌛", messageID, () => {}, true);
        api.sendMessage("🔍 Searching for an answer...", threadID, messageID);

        // Fetch Gemini API URL dynamically
        const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json');
        const geminiAPI = apiList.data.gemini;

        // API request
        const response = await axios.post(`${geminiAPI}/chat-with-gemini`, config);
        const result = response.data?.result || "No response from Gemini.";

        api.sendMessage(`🤖 Gemini's Response:\n\n${result}`, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};
