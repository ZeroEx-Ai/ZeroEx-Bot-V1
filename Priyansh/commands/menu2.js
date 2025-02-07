module.exports.config = {
    name: "menu2",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Adi.0X, Modified by You",
    description: "Menu command with categorized permissions",
    usages: "/menu user | /menu admin | /menu owner",
    commandCategory: "system",
    cooldowns: 5
};

module.exports.handleReply = ({ api, event, handleReply }) => {
    let num = parseInt(event.body.split(" ")[0].trim());
    (handleReply.bonus) ? num -= handleReply.bonus : num;
    let msg = "";
    let data = handleReply.content;
    let check = false;

    if (isNaN(num)) msg = "Not a number";
    else if (num > data.length || num <= 0) msg = "Not available";
    else {
        const { commands } = global.client;
        let dataAfter = data[num -= 1];

        if (handleReply.type == "cmd_info") {
            let command_config = commands.get(dataAfter).config;
            msg += `${command_config.commandCategory.toLowerCase()}\n`;
            msg += `\n+ Name: ${dataAfter}`;
            msg += `\n+ Description: ${command_config.description}`;
            msg += `\n+ Usage: ${(command_config.usages) ? command_config.usages : "No specific usage"}`;
            msg += `\n+ Cooldown: ${command_config.cooldowns || 5}s`;
            msg += `\n+ Permission: ${(command_config.hasPermssion == 0) ? "User" : (command_config.hasPermssion == 1) ? "Group Admin" : "Bot Owner"}`;
            msg += `\n\n» Module by ${command_config.credits} «`;
        } else {
            check = true;
            let count = 0;
            msg += `${dataAfter.group.toLowerCase()}\n`;

            dataAfter.cmds.forEach(item => {
                msg += `\n ${count += 1}. ${item}: ${commands.get(item).config.description}`;
            });
            msg += "\n\n+ Reply with a number to view command details";
        }
    }

    return api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) console.log(error);
        if (check) {
            global.client.handleReply.push({
                type: "cmd_info",
                name: this.config.name,
                messageID: info.messageID,
                content: data[num].cmds
            });
        }
    }, event.messageID);
};

module.exports.run = function ({ api, event, args }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const prefix = global.config.PREFIX;

    if (!args[0]) {
        return api.sendMessage(
            `Usage:\n/menu user - [For all users]\n/menu admin - [For Group Admin & Bot Owner]\n/menu owner - [For Bot Owner]`,
            threadID,
            messageID
        );
    }

    let permissionLevel;
    if (args[0].toLowerCase() === "user") permissionLevel = 0;
    else if (args[0].toLowerCase() === "admin") permissionLevel = 1;
    else if (args[0].toLowerCase() === "owner") permissionLevel = 2;
    else {
        return api.sendMessage("Invalid option! Use /menu user | /menu admin | /menu owner", threadID, messageID);
    }

    let categories = [];
    for (const commandConfig of commands.values()) {
        if (commandConfig.config.hasPermssion === permissionLevel) {
            let categoryName = commandConfig.config.commandCategory.toLowerCase();
            let category = categories.find(cat => cat.group === categoryName);
            if (!category) {
                categories.push({ group: categoryName, cmds: [commandConfig.config.name] });
            } else {
                category.cmds.push(commandConfig.config.name);
            }
        }
    }

    if (categories.length === 0) {
        return api.sendMessage("No commands available for this category.", threadID, messageID);
    }

    let msg = `Available categories for ${args[0].toUpperCase()}:\n`;
    categories.forEach((category, index) => {
        msg += `\n${index + 1}. ${category.group}`;
    });
    msg += "\n\n+ Reply with a number to view commands in that category.";

    return api.sendMessage(msg, threadID, (error, info) => {
        if (!error) {
            global.client.handleReply.push({
                type: "category",
                name: this.config.name,
                messageID: info.messageID,
                content: categories
            });
        }
    }, messageID);
};
