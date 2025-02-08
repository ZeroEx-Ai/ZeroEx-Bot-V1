const axios = require("axios");

module.exports.config = {
    name: "zeroex",
    version: "1.1.0",
    hasPermission: 0,
    credits: "ZeroEx",
    description: "Fetches response from zeroex-chat-api without prefix",
    commandCategory: "Chat bot",
    usages: "[message]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
};

const lastReplies = new Map();

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, messageID, body, senderID } = event;
    if (!body) return;

    const message = body.trim().toLowerCase();
    const g = (text) => api.sendMessage(text, threadID, messageID);

    // Check if the message starts with "zeroex" or "zerox"
    if (message.startsWith("zeroex") || message.startsWith("zerox")) {
        const query = message.split(" ").slice(1).join(" ").trim();

        if (!query) {
            return g("Please provide a message. Example: zeroex hi");
        }

        try {
            const response = await axios.post("https://zeroex-chat-api.onrender.com/chat", { message: query });

            if (response.data && response.data.reply) {
                g(response.data.reply);
                lastReplies.set(threadID, response.data.reply);
            } else {
                g("Amar jana nai, pls shikhan.");
            }
        } catch (error) {
            g("Ei samay kichu bhul hoise. Doya kore porer somoy try korun.");
        }
    } 
    // If replying to bot's last message
    else if (lastReplies.has(threadID) && senderID !== api.getCurrentUserID()) {
        const prevResponse = lastReplies.get(threadID);
        try {
            const response = await axios.post("https://zeroex-chat-api.onrender.com/chat", { message: message });

            if (response.data && response.data.reply) {
                g(response.data.reply);
                lastReplies.set(threadID, response.data.reply);
            } else {
                g("Amar jana nai, pls shikhan.");
            }
        } catch (error) {
            g("Ei samay kichu bhul hoise. Doya kore porer somoy try korun.");
        }
    }
};

module.exports.run = async function({ api, event, args }) {
    return api.sendMessage("Ei command prefix charai use korte hobe. Example: zeroex hello", event.threadID, event.messageID);
};
