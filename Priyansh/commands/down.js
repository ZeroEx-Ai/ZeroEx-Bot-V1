const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "down",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Download videos from Facebook, Instagram, Threads, Tweeter, TikTok, Pinterest, Capcut and Likee",
    commandCategory: "Media",
    usages: "/down [video URL]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("❌ Please provide a video URL to download.", event.threadID, event.messageID);
    }

    // Get the URL from the user's message
    const url = args.join(" ");
    const apiUrl = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`;

    api.sendMessage("🔄 Downloading video... Please wait.", event.threadID, event.messageID);

    try {
      const response = await axios.get(apiUrl);
      if (!response.data || !response.data.data) {
        throw new Error("❌ Unable to fetch video details.");
      }

      // Get the best available quality video URL (high quality, if available)
      let videoUrl = response.data.data.high || response.data.data.low;
      const videoTitle = response.data.data.title || "Downloaded Video";

      if (!videoUrl) {
        throw new Error("❌ No video available in high or low quality.");
      }

      // Create a temporary file path to save the video
      const filePath = path.join(__dirname, "cache", `${videoTitle}.mp4`);
      const writer = fs.createWriteStream(filePath);

      // Download the video file using axios
      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      videoResponse.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage(
          {
            body: `${videoTitle}`,
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          () => {
            fs.unlinkSync(filePath); // Clean up the file after sending
          },
          event.messageID
        );
      });

      writer.on('error', (err) => {
        console.error(`Download error: ${err}`);
        api.sendMessage("❌ Failed to download video. Please try again later.", event.threadID, event.messageID);
      });

    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage("❎ Failed to download video.\nPlease give only URLs from Facebook, Instagram, Threads, Twitter, TikTok, Pinterest, CapCut, and Likee.", event.threadID, event.messageID);
    }
  },
};
