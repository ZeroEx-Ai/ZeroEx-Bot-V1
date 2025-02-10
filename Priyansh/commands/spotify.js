const axios = require('axios');

module.exports = {
  config: {
    name: 'spotify',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'Adi.0X',
    description: 'Search for Spotify songs',
    commandCategory: 'Media',
    usages: '[songName]',
    cooldowns: 5,
    dependencies: {
      'axios': '',
    },
  },

  run: async function ({ api, event, args }) {
    let songName = args.join(' ');

    if (!songName) {
      // Ask for the song name
      const message = await api.sendMessage('❓ Please provide a song name to search on Spotify.', event.threadID, event.messageID);
      api.setMessageReaction("❓", message.messageID, () => {}, true);
      return;
    }

    // Perform Spotify search
    try {
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(songName)}&limit=5`;
      const searchResponse = await axios.get(searchUrl);
      const results = searchResponse.data.results;

      if (!results || results.length === 0) {
        return api.sendMessage('🚫 No songs found. Please try a different search.', event.threadID, event.messageID);
      }

      // Send the list of results to the user
      let resultMessage = '🔍 Here are 5 songs found:\n';
      results.forEach((song, index) => {
        resultMessage += `\n${index + 1}. ${song.name} - ${song.artists}`;
      });

      resultMessage += '\n\nReply with the number of the song you want to download (e.g., 1, 2, 3...)';
      
      const message = await api.sendMessage(resultMessage, event.threadID, event.messageID);
      api.setMessageReaction("✅", message.messageID, () => {}, true);

    } catch (error) {
      console.error(`Error in Spotify command: ${error.message}`);
      return api.sendMessage('🚫 There was an error while searching for the song. Please try again later.', event.threadID, event.messageID);
    }
  },
};
