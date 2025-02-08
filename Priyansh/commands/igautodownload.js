const instagramGetUrl = require("instagram-url-downloader"); // Using a more reliable package
const axios = require("axios");
const fs = require("fs-extra");
const tempy = require('tempy');

module.exports.config = {
    name: "igautodownload",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Priyansh Rajput",
    description: "Downloads Instagram video from HD link provided",
    commandCategory: "utility",
    usages: "[Instagram video URL]",
    cooldowns: 5,
    dependencies: {
        "instagram-url-downloader": "^0.0.3",
        "axios": "0.21.1",
        "fs-extra": "10.0.0",
        "tempy": "0.4.0"
    }
};

module.exports.handleEvent = async function({ api, event }) {
    if (event.type === "message" && event.body) {
        const igRegex = /https?:\/\/(www\.)?instagram\.com\/(reel|p)\/[^\s]+/gi;
        const urlMatch = event.body.match(igRegex);
        
        if (urlMatch) {
            const url = urlMatch[0];
            try {
                const result = await instagramGetUrl(url);
                if (!result || !result.download) {
                    throw new Error("No video found for the provided URL.");
                }

                const videoUrl = result.download;
                const response = await axios({
                    method: 'GET',
                    url: videoUrl,
                    responseType: 'stream'
                });

                const tempFilePath = tempy.file({ extension: 'mp4' });
                const writer = fs.createWriteStream(tempFilePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                const attachment = fs.createReadStream(tempFilePath);
                await api.sendMessage({
                    attachment,
                    body: "Here's your Instagram video:"
                }, event.threadID);

                fs.unlinkSync(tempFilePath);
            } catch (error) {
                console.error('Error:', error);
                api.sendMessage("❌ Unable to download the Instagram video. Please check the link and try again.", event.threadID);
            }
        }
    }
};

module.exports.run = function({ api, event }) {
    api.sendMessage("🔗 Send any Instagram reel/post link to automatically download the video!", event.threadID);
};
