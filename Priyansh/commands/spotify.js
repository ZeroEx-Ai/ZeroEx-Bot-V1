const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Temporary cache to store search results
const spotifyCache = {};

module.exports = {
  config: {
    name: "spotify",
    version: "1.0",
    hasPermssion: 0,
    credits: "Your Name",
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

    if (args.length === 0) {
      return api.sendMessage("🎵 Please enter a song name:", threadID, messageID);
    }

    try {
      const query = args.join(" ");
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(query)}&limit=5`;

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

      // Store results in cache
      spotifyCache[threadID] = {
        senderID,
        results,
        timestamp: Date.now()
      };

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
    const cache = spotifyCache[threadID];

    if (!cache || senderID !== cache.author) return;

    try {
      const selectedNumber = parseInt(body);
      if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > 5) {
        return api.sendMessage("❌ Please reply with a valid number (1-5).", threadID, messageID);
      }

      const track = cache.results[selectedNumber - 1];
      const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${track.url}`;

      api.setMessageReaction("⏳", messageID, () => {}, true);
      api.sendMessage("⬇️ Downloading track... Please wait...", threadID, messageID);

      const response = await axios.get(downloadUrl, { responseType: "stream" });
      const tempPath = path.join(__dirname, `cache/spotify_${Date.now()}.mp3`);

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const message = `🎵 Now Playing:\n\n${track.name}\nArtist: ${track.artists[0].name}\nReleased: ${track.album.release_date.split('-')[0]}`;
        
        api.sendMessage({
          body: message,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => {
          fs.unlinkSync(tempPath);
          // Unsend the original list message
          if (Reply.messageID) {
            api.unsendMessage(Reply.messageID);
          }
        }, messageID);
        
        api.setMessageReaction("🎶", messageID, () => {}, true);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to download the track.", threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
    } finally {
      // Clear cache after processing
      delete spotifyCache[threadID];
    }
  }
};
