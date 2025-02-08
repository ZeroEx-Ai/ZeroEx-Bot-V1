module.exports.config = {
    name: "help",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝙪𝙩",
    description: "Beginner's Guide",
    commandCategory: "system",
    usages: "[Tên module]",
    cooldowns: 1,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 60 // Auto delete after 60 seconds
    }
};

module.exports.languages = {
    "en": {
        "moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Waiting time: %5 seconds(s)\n❯ Permission: %6\n\n» Module code by %7 «",
        "helpList": '[ There are %1 commands on this bot, Use: "%2help nameCommand" to know how to use! ]',
        "user": "User",
        "adminGroup": "Admin group",
        "adminBot": "Admin bot"
    }
};

// Function to convert category text to bold Unicode
function toBoldUnicode(text) {
    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const bold = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇";
    
    return text.split("").map(char => {
        let index = normal.indexOf(char);
        return index !== -1 ? bold[index] : char;
    }).join("");
}

module.exports.run = function({ api, event, args, getText }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

    if (!args[0]) {
        const categories = {};
        
        // Grouping commands by categories
        for (const [name, command] of commands) {
            const category = command.config.commandCategory || "Uncategorized";
            if (!categories[category]) categories[category] = [];
            categories[category].push(name);
        }

        let msg = "Command List 📄\n\n";
        for (const [category, commandsList] of Object.entries(categories)) {
            msg += `${toBoldUnicode(category)}\n`; // Apply bold font
            msg += `${commandsList.join(", ")}\n\n`; // Join commands by commas
        }

        return api.sendMessage(msg, threadID, async (error, info) => {
            if (autoUnsend) {
                await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
                return api.unsendMessage(info.messageID);
            }
        }, messageID);
    }

    const command = commands.get((args[0] || "").toLowerCase());
    if (!command) return api.sendMessage("Command not found.", threadID, messageID);

    // Show command details (name, description, usages, permission)
    const commandDetails = `Command: ${command.config.name}
Description: ${command.config.description}
Usages: ${command.config.usages || "No usage provided"}
Permission: ${command.config.hasPermssion == 0 ? getText("user") : (command.config.hasPermssion == 1 ? getText("adminGroup") : getText("adminBot"))}`;

    return api.sendMessage(commandDetails, threadID, async (error, info) => {
        if (autoUnsend) {
            await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
            return api.unsendMessage(info.messageID);
        }
    }, messageID);
};
