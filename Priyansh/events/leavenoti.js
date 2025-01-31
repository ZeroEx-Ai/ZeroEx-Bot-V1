module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.0",
	credits: "𝙋𝙧𝙞𝙮𝙖𝙣𝙨𝙝 𝙍𝙖𝙟𝙥𝙪𝙩",
	description: "Notify when a person leaves the group with a text message",
	dependencies: {
		"moment-timezone": ""
	}
};

module.exports.run = async function({ api, event, Users, Threads }) {
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	const { threadID } = event;
	const moment = require("moment-timezone");

	// **ঢাকার সময় সেট করা হলো**
	const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:s");
	const hours = moment.tz("Asia/Dhaka").format("HH");

	const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
	const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
	const type = (event.author == event.logMessageData.leftParticipantFbId) ? "leave" : "removed";

	let msg = data.customLeave || 
` {name} is no longer in the group.
Reason {type}

Action Time {session} || {time}`;

	msg = msg.replace(/\{name}/g, name)
			 .replace(/\{type}/g, type)
			 .replace(/\{session}/g, 
				hours <= 10 ? "Morning" : 
				hours > 10 && hours <= 12 ? "Afternoon" :
				hours > 12 && hours <= 18 ? "Evening" : "Night")
			 .replace(/\{time}/g, time);  

	return api.sendMessage({ body: msg }, threadID);
};
