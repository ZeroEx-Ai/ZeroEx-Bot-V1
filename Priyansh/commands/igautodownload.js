const axios = require("axios");
const fs = require("fs-extra");
const tempy = require("tempy");

module.exports.config = {
    name: "autovideodownloader",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "CloudyVibes Dev",
    description: "Automatically downloads videos from Facebook, Instagram, TikTok, and YouTube.",
    commandCategory: "utility",
    usages: "Send a video link",
    cooldowns: 5,
    dependencies: {
        "axios": "latest",
        "fs-extra": "latest",
        "tempy": "latest"
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.type === "message" && event.body) {
        const videoUrl = event.body.trim();
        if (videoUrl.match(/(facebook\.com|instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/)) {
            try {
                const apiUrl = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(videoUrl)}`;
                const { data } = await axios.get(apiUrl, { headers: { "Content-Type": "application/json" } });

                if (!data || !data.video_url) {
                    throw new Error("Invalid response from API.");
                }

                const tempFilePath = tempy.file({ extension: "mp4" });
                const response = await axios.get(data.video_url, { responseType: "stream" });
                const writer = fs.createWriteStream(tempFilePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });

                await api.sendMessage({
                    attachment: fs.createReadStream(tempFilePath),
                    body: "✅ Here's the video you requested:"
                }, event.threadID);

                await fs.unlink(tempFilePath);
            } catch (error) {
                console.error("Error downloading video:", error);
                api.sendMessage("⚠️ Failed to download the video. Please try again later.", event.threadID, event.messageID);
            }
        }
    }
};

module.exports.run = async function ({ api, event }) {
    return api.sendMessage("⚠️ This command does not support direct execution. Just send a video link.", event.threadID, event.messageID);
};
