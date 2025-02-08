module.exports.config = {
    name: "out",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "Adi.0X",
    description: "Bot leaves on owner's command and notifies the owner.",
    commandCategory: "Admin",
    usages: "out or out [id]",
    cooldowns: 10,
};

module.exports.run = async function({ api, event, args }) {
    const ownerID = "OWNER_ID"; // Replace with your Facebook ID
    const threadID = args[0] || event.threadID;

    try {
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
        api.sendMessage(`✅ Successfully left the group: ${threadID}`, ownerID);
    } catch (error) {
        api.sendMessage(`❌ Failed to leave the group: ${threadID}\nError: ${error.message}`, ownerID);
    }
};
