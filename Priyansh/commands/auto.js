const fs = require("fs-extra");
const axios = require("axios");
const { alldown } = require("nayan-videos-downloader");

module.exports.config = {
    name: "auto",
    version: "0.0.2",
    hasPermssion: 0,
    credits: "Nayan",
    description: "Automatically download videos from links",
    commandCategory: "media",
    usages: "[url]",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
    const url = args[0];
    
    if (!url || !url.startsWith("http")) {
        return api.sendMessage("❌ Please provide a valid URL starting with http/https", event.threadID, event.messageID);
    }

    try {
        api.setMessageReaction("🔍", event.messageID, (err) => {}, true);
        
        const result = await alldown(url);
        const { high, title } = result.data;
        
        api.setMessageReaction("✔️", event.messageID, (err) => {}, true);
        
        const videoData = (await axios.get(high, { responseType: "arraybuffer" })).data;
        const path = __dirname + `/cache/auto_${event.senderID}.mp4`;
        
        fs.writeFileSync(path, Buffer.from(videoData));
        
        await api.sendMessage({
            body: `📽️ Video Title: ${title}`,
            attachment: fs.createReadStream(path)
        }, event.threadID, event.messageID);
        
        fs.unlinkSync(path);
    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Failed to download video. Please check the link and try again.", event.threadID, event.messageID);
    }
};
