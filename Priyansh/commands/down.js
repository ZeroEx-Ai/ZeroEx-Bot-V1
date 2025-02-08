const axios = require("axios");

module.exports = {
  config: {
    name: "down",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Modified by You",
    description: "Download videos from various platforms",
    commandCategory: "Media",
    usages: "/down [video URL]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("❌ Please provide a video URL to download.", event.threadID, event.messageID);
    }

    const url = args[0];
    const apiUrl = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`;

    api.sendMessage("🔄 Downloading video... Please wait.", event.threadID, event.messageID);

    try {
      const response = await axios.get(apiUrl);
      if (!response.data || !response.data.data) {
        throw new Error("❌ Unable to fetch video details.");
      }

      // Try to fetch high-quality video, fall back to low if not available
      let videoUrl = response.data.data.high || response.data.data.low;
      const videoTitle = response.data.data.title || "Downloaded Video";

      if (!videoUrl) {
        throw new Error("❌ No video available in high or low quality.");
      }

      api.sendMessage(
        {
          body: `✅ *Download Complete!*\n📌 *Title:* ${videoTitle}\n\n🔗 *Here is your video:*`,
          attachment: await global.utils.getStreamFromURL(videoUrl),
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage("❌ Failed to download video. Please check the URL and try again.", event.threadID, event.messageID);
    }
  },
};
