const axios = require("axios");

const searchAPI = "https://nayan-video-downloader.vercel.app/spotify-search?name=";

module.exports = {
  config: {
    name: "Spotify",
    version: "1.0.0",
    hasPermission: 0,
    credits: "ZeroEx-0X",
    description: "Search for songs on Spotify",
    commandCategory: "Music",
    usages: "/Spotify [song name]",
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("🎵 Please enter a song name:", threadID, messageID);
    }

    const songName = args.join(" ");
    const processingMsg = await api.sendMessage(`🔍 Searching for "${songName}"...`, threadID, messageID);

    try {
      const searchRes = await axios.get(`${searchAPI}${encodeURIComponent(songName)}&limit=5`);
      console.log("🔍 API Response:", searchRes.data);

      const songs = searchRes.data.results;
      if (!songs || songs.length === 0) {
        return api.sendMessage("❌ No songs found. Try another name.", threadID, messageID);
      }

      let response = "🔍 Here are 5 songs found:\n\n";
      songs.forEach((song, index) => {
        response += `${index + 1}. ${song.title} - ${song.artist} (${song.year || "Unknown"})\n`;
      });

      return api.sendMessage(response, threadID, messageID);

    } catch (error) {
      console.error("❌ Spotify Search API Error:", error.message);
      return api.sendMessage("⚠️ Error searching for the song. Try again later.", threadID, messageID);
    }
  }
};
