const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "spotify",
    version: "1.0",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Search and download Spotify tracks",
    commandCategory: "music",
    usages: "[song name]",
    cooldowns: 5,
    dependencies: {
      "axios": ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const cacheDir = path.join(__dirname, "cache");
    const cacheFile = path.join(cacheDir, `spotify_cache_${threadID}.json`);

    // Create cache directory if not exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    if (args.length === 0) {
      return api.sendMessage("🎵 Please enter a song name:", threadID, messageID);
    }

    try {
      const query = args.join(" ");
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${query}&limit=5`;

      api.setMessageReaction("🔍", messageID, () => {}, true);
      const response = await axios.get(searchUrl);
      const results = response.data.data;

      if (!results || results.length === 0) {
        return api.sendMessage("❌ No results found for your search.", threadID, messageID);
      }

      let message = "🎧 Spotify Search Results:\n\n";
      results.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ${item.artists[0].name} (${item.album.release_date.split('-')[0]})\n`;
      });
      message += "\nReply with the number of the track you want to download.";

      // Write cache to file
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
      console.error(error);
      api.sendMessage("❌ An error occurred while searching.", threadID, messageID);
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
      const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${track.url}`;

      api.setMessageReaction("⏳", messageID, () => {}, true);
      const processingMsg = await api.sendMessage("⬇️ Downloading track... Please wait...", threadID, messageID);

      const response = await axios.get(downloadUrl, { responseType: "stream" });
      const tempPath = path.join(__dirname, "cache", `spotify_${Date.now()}.mp3`);

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const message = `🎵 Now Playing:\n\n${track.name}\nArtist: ${track.artists[0].name}\nReleased: ${track.album.release_date.split('-')[0]}`;
        
        api.unsendMessage(processingMsg.messageID);
        api.sendMessage({
          body: message,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => {
          // Cleanup files
          fs.unlinkSync(tempPath);
          fs.unlinkSync(cacheFile);
        }, messageID);
        
        api.setMessageReaction("🎶", messageID, () => {}, true);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to download the track.", threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
      // Cleanup cache file on error
      if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
    }
  }
};
