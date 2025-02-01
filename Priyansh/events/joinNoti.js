module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "𝙋𝙧𝙞𝙮𝙖𝙣𝙨𝙝 𝙍𝙖𝙟𝙥𝙪𝙩",
    description: "Notification of bots or people entering groups",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "pidusage": ""
    }
};
 
module.exports.run = async function({ api, event }) {
    const { threadID } = event;
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? " " : global.config.BOTNAME}`, threadID, api.getCurrentUserID());
        return api.sendMessage(`╭───${global.config.BOTNAME}───◆\n⋄Status: Connected\n⋄Prefix » ${global.config.PREFIX} «\n⋄Owner: ${global.config.ADMIN}\n⋄Thank you for choosing ${global.config.BOTNAME}, have fun using it.\n╰──────────◆`, threadID);
    } else {
        try {
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);

            const threadData = global.data.threadData.get(parseInt(threadID)) || {};
            var mentions = [], nameArray = [], memLength = [], i = 0;
            
            for (id in event.logMessageData.addedParticipants) {
                const userName = event.logMessageData.addedParticipants[id].fullName;
                nameArray.push(userName);
                mentions.push({ tag: userName, id });
                memLength.push(participantIDs.length - i++);
            }
            memLength.sort((a, b) => a - b);
            
            let msg = (typeof threadData.customJoin == "undefined") 
                ? "╭───Welcome───◆\n⋄New member name: {name}\n⋄Total member: {soThanhVien}\nWelcome to {threadName} Group.\n╰──────────◆"
                : threadData.customJoin;

            msg = msg
                .replace(/\{name}/g, nameArray.join(', '))
                .replace(/\{type}/g, (memLength.length > 1) ?  'Friends' : 'Friend')
                .replace(/\{soThanhVien}/g, memLength.join(', '))
                .replace(/\{threadName}/g, threadName);

            return api.sendMessage({ body: msg, mentions }, threadID);
        } catch (e) { 
            return console.log(e);
        }
    }
};
