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

    // Check if the reply has an image attachment
    const isImageReply = messageReply?.attachments && messageReply.attachments[0]?.type === 'image';

    let query = args.join(" ");
    
    if (isImageReply) {
        // If the reply contains an image, process the image and text
        const imageUrl = messageReply.attachments[0]?.url;

        try {
            api.setMessageReaction("⌛", messageID, () => {}, true);
            api.sendMessage("🔍 Analyzing the image and your query...", threadID, messageID);

            // Process the image and send both the image URL and text to Gemini (assuming Gemini supports this)
            const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json');
            const geminiAPI = apiList.data.gemini;

            // Make a request to the Gemini API with both image and text prompt
            const response = await axios.post(`${geminiAPI}/gemini`, {
                modelType: "image_and_text",  // Assuming this is the correct type for multimodal input
                imageUrl: imageUrl,           // Image URL to be processed
                prompt: query                 // Text prompt to go along with the image
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
            api.sendMessage("❌ An error occurred while processing the image and your query.", threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
        }
    } else {
        // If no image, proceed with the normal query
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
