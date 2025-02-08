module.exports.config = {
    name: "zdelres",
    version: "1.0.0",
    hasPermission: 2, // You can change this value if you want to adjust the required permission level
    credits: "ZeroEx",
    description: "Remove a specific response from an input in ZeroEx chat API",
    commandCategory: "Chat bot",
    usages: "[input] => [response]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const input = args.join(" ").split("=>")[0]?.trim().toLowerCase();
    const response = args.join(" ").split("=>")[1]?.trim();

    if (!input || !response) {
        return api.sendMessage("Please use the correct format: Zdelres [input] => [response]\nExample: Zdelres hello => hi\nThis will delete the specified response.", threadID, messageID);
    }

    try {
        const res = await axios.post("https://zeroex-chat-api.onrender.com/delete-response", { input, response });

        if (res.data && res.data.message) {
            return api.sendMessage(res.data.message, threadID, messageID);
        } else {
            return api.sendMessage("Something went wrong, please try again later.", threadID, messageID);
        }
    } catch (error) {
        console.error(error); // Log error for debugging purposes
        return api.sendMessage("There was an error with the API. Please try again later.", threadID, messageID);
    }
};
