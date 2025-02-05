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

    let query = args.join(" ");
    
    if (messageReply?.attachments && messageReply.attachments[0]?.type === 'image') {
        // If the reply contains an image
        const imageUrl = messageReply.attachments[0]?.url;
        
        // Call an image analysis API (Replace with actual image analysis API)
        try {
            api.setMessageReaction("⌛", messageID, () => {}, true);
            api.sendMessage("🔍 Analyzing the image...", threadID, messageID);

            // Example image prompt generation API (this part needs to be adapted to your actual API or logic)
            const imagePromptResponse = await axios.post('https://api.example.com/analyze-image', {
                imageUrl: imageUrl
            });

            const imagePrompt = imagePromptResponse.data?.prompt || "Could not generate a prompt for this image.";

            api.sendMessage(`🖼️ Image Analysis Prompt:\n\n${imagePrompt}`, threadID, messageID);
            api.setMessageReaction("✅", messageID, () => {}, true);
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ An error occurred while analyzing the image.", threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
        }
    } else {
        // If no image is found, proceed with the regular query
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
    }
};
