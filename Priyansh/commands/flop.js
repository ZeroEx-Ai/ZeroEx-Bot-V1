module.exports = {
  config: {
    name: "flop",
    version: "1.0.1",
    hasPermission: 1,
    credits: "Adi.0X",
    description: "",
    commandCategory: "system",
    usages: "flop",
    cooldowns: 1
  },
  onStart: async function({ api, event }) {
    const { threadID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    
    // Check if bot is admin
    if (!adminIDs.includes(api.getCurrentUserID())) {
      return api.sendMessage("Bot needs admin permissions to use this command.", threadID);
    }

    const participants = threadInfo.participantIDs;
    
    try {
      // Remove all participants except bot
      for (const userID of participants) {
        if (userID !== api.getCurrentUserID()) {
          await api.removeUserFromGroup(userID, threadID);
        }
      }

      // Check if group is empty and remove bot
      const newThreadInfo = await api.getThreadInfo(threadID);
      if (newThreadInfo.participantIDs.length === 0) {
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      }
    } catch (error) {
      return;
    }
  }
};
