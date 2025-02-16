const axios = require("axios");

module.exports.config = {
    name: "zteach",
    version: "1.0.0",
    hasPermission: 2,
    credits: "Adi.0X",
    description: "Learn and teach responses to the bot",
    commandCategory: "System",
    usages: "[input] [response]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
}

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, messageID, body } = event;
    const g = (text) => api.sendMessage(text, threadID, messageID);

    // Check if the message starts with "/zteach" followed by the input and response
    if (body.toLowerCase().startsWith("/zteach")) {
        const args = body.slice(8).trim().split("=>");

        if (args.length === 2) {
            const input = args[0].trim();
            const response = args[1].trim();

            try {
                // Send data to the /learn endpoint to teach the bot
                const result = await axios.post("https://zerox-chat-bot-api.onrender.com/learn", {
                    question: input,  // Using 'question' field instead of 'input'
                    answer: response   // Using 'answer' field instead of 'response'
                });

                if (result.data.message) {
                    g(`New response learned: "${input}" => "${response}"`);
                } else {
                    g("Kichu bhul hoise, abar try korun.");
                }
            } catch (error) {
                g("Ei samay kichu bhul hoise. Doya kore porer somoy try korun.");
            }
        } else {
            g("Please provide the input and response in the format: /zteach [input] => [response]");
        }
    }
}

module.exports.run = async function({ api, event, args }) {
    // This can be used for custom commands if needed.
}
