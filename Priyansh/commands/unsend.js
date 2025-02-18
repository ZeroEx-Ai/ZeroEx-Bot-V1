module.exports.config = {
  name: "unsend",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "Adi.0X (Modified by ChatGPT)",
  description: "বটের মেসেজ reply বা 👍 রিয়্যাকশনের মাধ্যমে Unsending করে",
  commandCategory: "system",
  usages: "unsend [reply]",
  cooldowns: 0
};

module.exports.languages = {
  "vi": {
    "returnCant": "Không thể gỡ tin nhắn của người khác.",
    "missingReply": "Hãy reply করে মেসেজটি Unsending করার জন্য, অথবা এই মেসেজে 👍 রিয়্যাক্ট করলে Unsending হবে।"
  },
  "en": {
    "returnCant": "I can't unsend someone else's message.",
    "missingReply": "Reply to the message you want me to unsend, or react with 👍 to this message to unsend it."
  }
};

module.exports.run = function({ api, event, getText }) {
  const botID = api.getCurrentUserID();

  // Case 1: Reply করে Unsending করা
  if (event.type === "message_reply") {
    if (event.messageReply.senderID != botID)
      return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
    return api.unsendMessage(event.messageReply.messageID);
  }

  // Case 2: Reply না করলে, instruction message পাঠানো হবে,
  // যেটিতে 👍 রিয়্যাক্ট করলে Unsending হবে।
  return api.sendMessage(getText("missingReply"), event.threadID, (err, info) => {
    if (err) return;
    global.client.handleReaction.push({
      name: "unsend",
      messageID: info.messageID,
      author: event.senderID
    });
  });
};

module.exports.handleReaction = ({ api, event, handleReaction, getText }) => {
  const botID = api.getCurrentUserID();
  
  // শুধু মূল command invoker এর রিয়্যাকশন গ্রহণ করা হবে
  if (event.userID !== handleReaction.author) return;
  
  // শুধু 👍 রিয়্যাকশন এ কাজ হবে
  if (event.reaction !== "👍") return;
  
  // Unsending the message that was sent as instruction
  api.unsendMessage(handleReaction.messageID, (err) => {
    if (err) api.sendMessage("Error unsending the message.", event.threadID);
  });
  
  // Remove the handleReaction object from the global array
  const index = global.client.handleReaction.findIndex(e => e.messageID == handleReaction.messageID);
  if (index > -1) global.client.handleReaction.splice(index, 1);
};
