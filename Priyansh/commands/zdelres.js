module.exports.config = {
    name: "zdelres",
    version: "1.0.0",
    hasPermission: 0,
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
        return api.sendMessage("Use this format: Zdelres [input] => [response]\nExample: Zdelres hello => hi", threadID, messageID);
    }

    try {
        const res = await axios.post("https://zeroex-chat-api.onrender.com/delete-response", { input, response });

        if (res.data && res.data.message) {
            return api.sendMessage(res.data.message, threadID, messageID);
        } else {
            return api.sendMessage("Kono error hoise, porer somoy try koro.", threadID, messageID);
        }
    } catch (error) {
        return api.sendMessage("API te kono error hoise, later try koro.", threadID, messageID);
    }
};
