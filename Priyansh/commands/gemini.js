const axios = require("axios");

module.exports.config = {
    name: "gemini",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Ask anything from Gemini AI",
    commandCategory: "Ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: { "axios": "1.4.0" }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let query = args.join(" ");
    
    // Jodi kono message er reply te use kora hoy
    if (messageReply?.body) {
        query = messageReply.body + " " + query;
    }

    if (!query.trim()) return api.sendMessage("Please type your question...", threadID, messageID);

    try {
        api.setMessageReaction("⌛", messageID, () => {}, true);
        api.sendMessage("🔍 Searching for an answer...", threadID, messageID);

        // Gemini API URL fetch
        const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json');
        const geminiAPI = apiList.data.gemini;

        // API request
        const response = await axios.post(`${geminiAPI}/gemini`, {
            modelType: "text_only",
            prompt: query
        });

        const result = response.data?.result;

        if (result) {
            api.sendMessage(`${result}`, threadID, messageID);
            api.setMessageReaction("✅", messageID, () => {}, true);
        } else {
            throw new Error("No valid response from API");
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};
