// config.js
module.exports.config = {
    name: 'autoban',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'ManhG',
    description: 'People who curse bots will be automatically banned from the system <3',
    commandCategory: 'noprefix',
    usages: '',
    cooldowns: 0,
    dependencies: {}
};

// event_handler.js
module.exports.handleEvent = async ({ event, api, Users }) => {
    const { threadID, senderID, body } = event;
    const moment = require('moment-timezone');
    const time = moment.tz('Asia/Manila').format('HH:MM:ss L');

    if (senderID === api.getCurrentUserID()) return;

    const userName = await Users.getNameUser(senderID);
    const adminNotification = `=== Bot Notification ===\n\n🆘 Sinner: ${userName}\n🔰 UID: ${senderID}\n😥 Message: `;
    const userResponse = `» Notice from Owner «\n\n${userName}, You are stupid for cursing bots. You have been automatically banned from the system.`;

    const curseWords = [
        "bot cdi", "/fuck", "/sex", "/porn", "/nude",
        "/nudes", "/hot", "/hentai", "/heda", "/penis", "/virginia", "dhoner bot", "bot cdi", "bot er maire cdi",
        "Adi madarchod", "Adi heda"
    ];

    for (const curse of curseWords) {
        const formattedCurse = curse[0].toUpperCase() + curse.slice(1);
        if ([curse.toUpperCase(), curse, formattedCurse].includes(body)) {
            console.log(`[CURSE DETECTED] ${userName}: ${curse}`);

            // Ban the user
            const userData = Users.getData(senderID).data || {};
            Users.setData(senderID, {
                data: {
                    ...userData,
                    banned: 1,
                    reason: curse,
                    dateAdded: time
                }
            });

            global.data.userBanned.set(senderID, {
                reason: curse,
                dateAdded: time
            });

            // Send responses
            await api.sendMessage(userResponse, threadID);
            
            // Notify admins
            const admins = global.config.ADMINBOT || [];
            for (const admin of admins) {
                await api.sendMessage(
                    `${adminNotification}${curse}\n\nBanned from system`,
                    admin
                );
            }
            break;
        }
    }
};

// command_handler.js
module.exports.run = async ({ event, api }) => {
    const asciiArt = `
    ( \\_/) 
    ( •_•) 
    // >🧠 
    
    Give me your brain and put it in your head.
    Do you know if it's the Noprefix command??`;
    
    api.sendMessage(asciiArt, event.threadID);
};
