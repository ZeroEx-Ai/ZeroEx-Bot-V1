module.exports.config = {
    name: "help",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Beginner's Guide",
    commandCategory: "system",
    usages: "[Tên module]",
    cooldowns: 1,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 300
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

module.exports.handleEvent = function ({ api, event, getText }) {
    const { commands } = global.client;
    const { threadID, messageID, body } = event;

    if (!body || typeof body == "undefined" || body.indexOf("help") != 0) return;
    const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
    if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const command = commands.get(splitBody[1].toLowerCase());
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
    return api.sendMessage(getText("moduleInfo", command.config.name, command.config.description, `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`, command.config.commandCategory, command.config.cooldowns, ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")), command.config.credits), threadID, messageID);
};

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
            msg += `${category}\n`;
            commandsList.forEach(commandName => {
                msg += `- ${prefix}${commandName}\n`;
            });
            msg += "\n";
        }

        const totalPages = Math.ceil(Object.keys(categories).length / 1); // 1 per page, change as needed for pagination
        const pageText = `\nPage 1/${totalPages}`;

        return api.sendMessage(msg + pageText, threadID, async (error, info) => {
            if (autoUnsend) {
                await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
                return api.unsendMessage(info.messageID);
            } else return;
        }, messageID);
    }

    const command = commands.get((args[0] || "").toLowerCase());
    if (!command) return api.sendMessage("Command not found.", threadID, messageID);

    // Show command details (name, description, usages, permission)
    const commandDetails = `Command: ${prefix}${command.config.name}
Description: ${command.config.description}
Usages: ${command.config.usages || "No usage provided"}
Permission: ${command.config.hasPermssion == 0 ? getText("user") : (command.config.hasPermssion == 1 ? getText("adminGroup") : getText("adminBot"))}`;

    return api.sendMessage(commandDetails, threadID, async (error, info) => {
        if (autoUnsend) {
            await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
            return api.unsendMessage(info.messageID);
        } else return;
    }, messageID);
};
