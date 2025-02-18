module.exports.config = {
	name: "unsend",
	version: "1.0.2",
	hasPermssion: 1,
	credits: "Adi.0X (Modified by ChatGPT)",
	description: "Gỡ tin nhắn của bot (hoặc khi phản ứng 😡 vào tin nhắn)",
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

module.exports.run = function({ api, event, getText }) {
	const botID = api.getCurrentUserID();
	// Check if it's a message reply
	if (event.type === "message_reply") {
		if (event.messageReply.senderID != botID) 
			return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
		return api.unsendMessage(event.messageReply.messageID);
	}
	// Check if it's a reaction (😡)
	if (event.type === "message_reaction") {
		if (event.reaction === "😡" && event.messageID) {
			return api.unsendMessage(event.messageID);
		}
	}
	return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
};
