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

// Function to convert category text to bold Unicode as per your exact mapping
function toBoldUnicode(text) {
    const mapping = {
        "A":"𝗔", "B":"𝗕", "C":"𝗖", "D":"𝗗", "E":"𝗘", "F":"𝗙", "G":"𝗚", "H":"𝗛", "I":"𝗜", "J":"𝗝",
        "K":"𝗞", "L":"𝗟", "M":"𝗠", "N":"𝗡", "O":"𝗢", "P":"𝗣", "Q":"𝗤", "R":"𝗥", "S":"𝗦", "T":"𝗧",
        "U":"𝗨", "V":"𝗩", "W":"𝗪", "X":"𝗫", "Y":"𝗬", "Z":"𝗭",
        "a":"𝗮", "b":"𝗯", "c":"𝗰", "d":"𝗱", "e":"𝗲", "f":"𝗳", "g":"𝗴", "h":"𝗵", "i":"𝗶", "j":"𝗷",
        "k":"𝗸", "l":"𝗹", "m":"𝗺", "n":"𝗻", "o":"𝗼", "p":"𝗽", "q":"𝗾", "r":"𝗿", "s":"𝘀", "t":"𝘁",
        "u":"𝘂", "v":"𝘃", "w":"𝘄", "x":"𝘅", "y":"𝘆", "z":"𝘇"
    };
    
    return text.split("").map(char => mapping[char] || char).join("");
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
            msg += `${toBoldUnicode(category)}\n`; // Apply bold font exactly as per mapping
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
