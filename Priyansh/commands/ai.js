const axios = require("axios");

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
        "axios": "1.4.0"
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    // নতুন মেসেজ ও রিপ্লাই মেসেজ একসাথে যোগ করা
    let query = args.join(" ");
    if (messageReply?.body) {
        query = messageReply.body + " " + query;
    }

    if (!query.trim()) return api.sendMessage("Please type your question...", threadID, messageID);

    try {
        api.setMessageReaction("⌛", messageID, () => {}, true);
        api.sendMessage("🔍 Searching for an answer...", threadID, messageID);

        // Fetch dynamic API endpoint
        const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json');
        const geminiAPI = apiList.data.gemini;

        // Send request to Gemini API
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
};
