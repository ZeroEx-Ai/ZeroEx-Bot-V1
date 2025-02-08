const axios = require("axios");

module.exports.config = {
    name: "zeroex",
    version: "1.0.0",
    hasPermission: 0,
    credits: "ZeroEx",
    description: "Fetches response from zeroex-chat-api",
    commandCategory: "Chat bot",
    usages: "[args]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
}

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, messageID, body } = event;
    const g = (text) => api.sendMessage(text, threadID, messageID);

    // Check if the message starts with "/zeroex" followed by the message
    if (body.toLowerCase().startsWith("/zeroex")) {
        const message = body.slice(8).trim(); // Extract the message after "/zeroex"

        if (message) {
            try {
                const response = await axios.post("https://zeroex-chat-api.onrender.com/chat", {
                    message: message
                });
                
                if (response.data && response.data.reply) {
                    g(response.data.reply); // Send the response from the API
                } else {
                    g("Amar jana nai, pls shikhan"); // If no reply
                }
            } catch (error) {
                g("Ei samay kichu bhul hoise. Doya kore porer somoy try korun.");
            }
        } else {
            g("Please provide a message after '/zeroex'. Example: /zeroex hi");
        }
    }
}

module.exports.run = async function({ api, event, args }) {
    // This can be used for custom commands if needed.
}
