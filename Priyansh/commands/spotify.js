const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "spotify",
    version: "1.1",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Search and download Spotify tracks",
    commandCategory: "music",
    usages: "[song name]",
    cooldowns: 5,
    dependencies: { "axios": "" }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const cacheDir = path.join(__dirname, "cache");
    const cacheFile = path.join(cacheDir, `spotify_cache_${threadID}.json`);

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    if (args.length === 0) {
      return api.sendMessage("🎵 Please enter a song name:", threadID, messageID);
    }

    try {
      const query = args.join(" ");
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${query.replace(/ /g, "+")}&limit=5`;

      api.setMessageReaction("🔍", messageID, () => {}, true);
      
      // Added timeout and better error handling
      const response = await axios.get(searchUrl, { timeout: 10000 });
      
      console.log("API Response:", response.data); // Debug log

      if (!response.data || !response.data.data || !response.data.data.length) {
        return api.sendMessage("❌ No results found for your search.", threadID, messageID);
      }

      const results = response.data.data;
      let message = "🎧 Spotify Search Results:\n\n";
      results.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ${item.artists[0].name} (${item.album.release_date.split('-')[0]})\n`;
      });
      message += "\nReply with the number (1-5) to download";

      // Write cache with expiration (5 minutes)
      const cacheData = {
        senderID,
        results,
        timestamp: Date.now()
      };
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData));

      await api.sendMessage(message, threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      }, messageID);
      
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (error) {
      console.error("Search Error:", error);
      api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  },

  onReply: async function({ api, event, Reply, args }) {
    const { threadID, messageID, senderID, body } = event;
    const cacheFile = path.join(__dirname, "cache", `spotify_cache_${threadID}.json`);

    if (!fs.existsSync(cacheFile)) return;

    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile));
      if (senderID !== cacheData.senderID) return;

      const selectedNumber = parseInt(body);
      if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > 5) {
        return api.sendMessage("❌ Please reply with a valid number (1-5).", threadID, messageID);
      }

      const track = cacheData.results[selectedNumber - 1];
      const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${encodeURIComponent(track.url)}`;

      api.setMessageReaction("⏳", messageID, () => {}, true);
      const processingMsg = await api.sendMessage("⬇️ Downloading track... (This may take 20-30 seconds)", threadID, messageID);

      // Added timeout and better download handling
      const response = await axios.get(downloadUrl, {
        responseType: "stream",
        timeout: 30000
      });

      const tempPath = path.join(__dirname, "cache", `spotify_${Date.now()}.mp3`);
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        api.unsendMessage(processingMsg.messageID);
        api.sendMessage({
          body: `🎵 Now Playing:\n${track.name}\nArtist: ${track.artists[0].name}\nReleased: ${track.album.release_date.split('-')[0]}`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => {
          fs.unlinkSync(tempPath);
          fs.unlinkSync(cacheFile);
        }, messageID);
        api.setMessageReaction("🎶", messageID, () => {}, true);
      });

      writer.on("error", (err) => {
        console.error("Download Error:", err);
        api.sendMessage("❌ Failed to save the audio file", threadID, messageID);
        fs.unlinkSync(tempPath);
      });

    } catch (error) {
      console.error("Download Error:", error);
      api.sendMessage(`❌ Download failed: ${error.message}`, threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
    }
  }
};
