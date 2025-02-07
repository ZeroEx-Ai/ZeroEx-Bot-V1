const axios = require("axios");

module.exports.config = {
    name: "gemini",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Ask anything from Gemini AI (supports text + images)",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: { "axios": "1.4.0" }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let query = args.join(" ");
    let imageBase64 = null;

    // Check for message reply (text or image)
    if (messageReply) {
        // Combine text from reply with current query
        if (messageReply.body) {
            query = messageReply.body + " " + query;
        }

        // Check for image attachment in reply
        if (messageReply.attachments?.[0]?.type === "photo") {
            const imageUrl = messageReply.attachments[0].url;
            try {
                // Download image and convert to base64
                const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
                imageBase64 = Buffer.from(imageResponse.data, "binary").toString("base64");
            } catch (error) {
                console.error("Failed to download image:", error);
                return api.sendMessage("❌ Failed to process the image.", threadID, messageID);
            }
        }
    }

    if (!query.trim() && !imageBase64) {
        return api.sendMessage("Please provide a question or image.", threadID, messageID);
    }

    try {
        api.setMessageReaction("⌛", messageID, () => {}, true);
        api.sendMessage("🔍 Processing your request...", threadID, messageID);

        // Fetch Gemini API URL
        const apiList = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json');
        const geminiAPI = apiList.data.gemini;

        // Prepare payload based on input type
        const payload = {
            modelType: imageBase64 ? "text_image" : "text_only",
            prompt: imageBase64 
                ? { text: query, image: imageBase64 }  // For image+text
                : query                                // For text-only
        };

        // Send request to Gemini API
        const response = await axios.post(`${geminiAPI}/gemini`, payload);
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
