module.exports.config = {
  name: "unsend",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "Adi.0X (Modified by ChatGPT)",
  description: "Boter message unsend korbe – reply korle ba 👍 reaction dile",
  commandCategory: "system",
  usages: "unsend",
  cooldowns: 0
};

module.exports.languages = {
  "vi": {
    "returnCant": "Không thể gỡ tin nhắn của người khác.",
    "missingReply": "Hãy reply tin nhắn cần gỡ."
  },
  "en": {
    "returnCant": "I can't unsend someone else's message.",
    "missingReply": "Reply to the message you want me to unsend."
  }
};

/**
 * run: Jodi command diye call kore, tahole reply thakle unsend korbe.
 */
module.exports.run = function({ api, event, getText }) {
  const botID = api.getCurrentUserID();

  // Reply diye call korle:
  if (event.type === "message_reply") {
    if (event.messageReply.senderID != botID)
      return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
    return api.unsendMessage(event.messageReply.messageID);
  }

  // Jodi reaction er jonno call hoy, user ke bolbe reply korte:
  return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
};

/**
 * handleReaction: Jodi unsend-er message e reaction hoy,
 * ar reaction 👍 hoy, tahole message ta unsend korbe.
 */
module.exports.handleReaction = ({ api, event, handleReaction, getText }) => {
  const botID = api.getCurrentUserID();

  // Shudhu original request korar author reaction dile kaj korbe:
  if (event.userID !== handleReaction.author) return;

  // Reaction jodi 👍 na hoy, tahole kichu korbe na:
  if (event.reaction !== "👍") return;

  // Prothome check korchi je je message ta reaction pawa jacche, seta bot-er to naki:
  api.getMessageInfo(event.messageID, (err, info) => {
    if (err) return api.sendMessage("Error retrieving message info.", event.threadID, event.messageID);
    if (info.senderID != botID)
      return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
    // Thik thakle unsend kore:
    api.unsendMessage(event.messageID);
  });

  // Reaction handle korar por, handleReaction array theke remove kore dicchi:
  const index = global.client.handleReaction.findIndex(e => e.messageID == handleReaction.messageID);
  if (index > -1) global.client.handleReaction.splice(index, 1);
};
