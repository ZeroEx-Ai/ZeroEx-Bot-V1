const axios = require("axios");

module.exports.config = {
    name: "zeroex",
    version: "1.3.0",
    hasPermission: 0,
    credits: "ZeroEx",
    description: "Chat Bot mentioned or replied",
    commandCategory: "Ai",
    usages: "type zerox/zeroex/bot without prefix and reply",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
};

const lastReplies = new Map(); // Store last responses for each thread

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, messageID, body, senderID, messageReply } = event;
    if (!body) return;

    const message = body.trim().toLowerCase();
    const sendMessage = (text) => api.sendMessage(text, threadID, messageID);

    // **Only trigger if message starts with "zeroex" or "zerox"**
    if (message.startsWith("zeroex") || message.startsWith("zerox") || message.startsWith("bot")) {
        const query = message.split(" ").slice(1).join(" ").trim();

        if (!query) {
            return sendMessage("Ha bolo");
        }

        try {
            const response = await axios.post("https://zerox-chat-bot-api.onrender.com/chat", { message: query });

            if (response.data && response.data.reply) {
                sendMessage(response.data.reply);
                lastReplies.set(threadID, { user: senderID, reply: response.data.reply });
            } else {
                sendMessage("Amar jana nai, pls shikhan.");
            }
        } catch (error) {
            sendMessage("Ei samay kichu bhul hoise. Doya kore porer somoy try korun.");
        }
    } 
    // **Reply Detection: Only respond if the message is a reply to bot's last message**
    else if (messageReply && lastReplies.has(threadID)) {
        const lastReplyData = lastReplies.get(threadID);

        if (messageReply.body === lastReplyData.reply && senderID !== api.getCurrentUserID()) {
            try {
                const response = await axios.post("https://zerox-chat-bot-api.onrender.com/chat", { message: message });

                if (response.data && response.data.reply) {
                    sendMessage(response.data.reply);
                    lastReplies.set(threadID, { user: senderID, reply: response.data.reply });
                } else {
                    sendMessage("Amar jana nai, pls shikhan.");
                }
            } catch (error) {
                sendMessage("Ei samay kichu bhul hoise. Doya kore porer somoy try korun.");
            }
        }
    }
};

module.exports.run = async function({ api, event, args }) {
    return api.sendMessage("Ei command prefix charai use korte hobe. Example: zeroex hello", event.threadID, event.messageID);
};
