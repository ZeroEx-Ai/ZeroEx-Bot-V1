const axios = require('axios');
const fs = require('fs');
const path = require('path');

const activeSearches = new Map();

module.exports = {
  config: {
    name: "spotify",
    version: "2.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Search and download Spotify songs",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
    dependencies: { "axios": "" }
  },

  run: async function ({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const key = `${threadID}_${senderID}`;

    // Handle song selection reply
    if (activeSearches.has(key)) {
      try {
        const selection = parseInt(args[0]);
        const results = activeSearches.get(key);
        
        if (isNaN(selection) || selection < 1 || selection > 5) {
          activeSearches.delete(key);
          return api.sendMessage("❌ Invalid selection. Please use numbers 1-5.", threadID, messageID);
        }

        const selectedSong = results[selection - 1];
        api.sendMessage("⏳ Downloading your song...", threadID, messageID);

        const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${selectedSong.link}`;
        const response = await axios.get(downloadUrl);
        const audioUrl = response.data.download_url;

        if (!audioUrl) throw new Error("No download URL found");

        const audioPath = path.join(__dirname, `cache/spotify_${Date.now()}.mp3`);
        const writer = fs.createWriteStream(audioPath);
        
        const audioResponse = await axios({
          method: 'GET',
          url: audioUrl,
          responseType: 'stream'
        });

        audioResponse.data.pipe(writer);

        writer.on('finish', async () => {
          await api.sendMessage({
            attachment: fs.createReadStream(audioPath),
            body: `🎧 ${selectedSong.name}`
          }, threadID);
          
          fs.unlinkSync(audioPath);
          activeSearches.delete(key);
        });

      } catch (error) {
        console.error(error);
        activeSearches.delete(key);
        return api.sendMessage("❌ Failed to download the song.", threadID, messageID);
      }
      return;
    }

    // Handle initial search request
    const songName = args.join(' ');
    if (!songName) return api.sendMessage("❓ Please enter a song name to search.", threadID, messageID);

    try {
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${songName}&limit=5`;
      const response = await axios.get(searchUrl);
      const results = response.data.results;

      if (!results?.length) {
        return api.sendMessage("🚫 No results found for your search.", threadID, messageID);
      }

      let message = "🔍 Search Results:\n\n";
      results.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ${item.artists}\n`;
      });
      message += "\nReply with the number (1-5) to download.";

      activeSearches.set(key, results);
      api.sendMessage(message, threadID, messageID);

    } catch (error) {
      console.error(error);
      activeSearches.delete(key);
      api.sendMessage("🚫 Error searching Spotify.", threadID, messageID);
    }
  }
};
