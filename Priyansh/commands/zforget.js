const axios = require("axios");

module.exports.config = {
    name: "zforget",
    version: "1.0.0",
    hasPermission: 2,
    credits: "ZeroEx",
    description: "Forget a learned response",
    commandCategory: "Chat bot",
    usages: "[input] [response]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
}

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, messageID, body } = event;
    const g = (text) => api.sendMessage(text, threadID, messageID);

    // Check if the message starts with "/zforget" followed by the input and response to forget
    if (body.toLowerCase().startsWith("/zforget")) {
        const args = body.slice(8).trim().split("=>");

        if (args.length === 2) {
            const input = args[0].trim();
            const response = args[1].trim();

            try {
                // Send data to the /forget endpoint to remove the response
                const result = await axios.post("https://zerox-chat-bot-api.onrender.com/forget", {
                    question: input,  // Using 'question' field for the input
                    answer: response   // Using 'answer' field for the response
                });

                if (result.data.message) {
                    g(`Response forgotten: "${input}" => "${response}"`);
                } else {
                    g("Kichu bhul hoise, abar try korun.");
                }
            } catch (error) {
                g("Ei samay kichu bhul hoise. Doya kore porer somoy try korun.");
            }
        } else {
            g("Please provide the input and response in the format: /zforget [input] => [response]");
        }
    }
}

module.exports.run = async function({ api, event, args }) {
    // This can be used for custom commands if needed.
}
