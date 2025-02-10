const axios = require('axios');

module.exports = {
  config: {
    name: 'spotify',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'Developer Name',
    description: 'Search for Spotify songs and download them',
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
      // If no song name is provided, ask for the song name
      return api.sendMessage('❓ Please provide a song name to search on Spotify.', event.threadID, event.messageID);
    }

    // Perform Spotify search
    try {
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(songName)}&limit=5`;
      const searchResponse = await axios.get(searchUrl);

      // Log the API response to check the data structure
      console.log("Search Response:", searchResponse.data);

      const results = searchResponse.data.results;

      if (!results || results.length === 0) {
        return api.sendMessage('🚫 No songs found. Please try a different search.', event.threadID, event.messageID);
      }

      // Send the list of results to the user
      let resultMessage = '🔍 Here are 5 songs found:\n';
      results.forEach((song, index) => {
        // Logging individual song data to check field names
        console.log(`Song ${index + 1}:`, song);
        
        // Ensure the correct field names are being used for song name and artist
        resultMessage += `\n${index + 1}. ${song.name || "Unknown Song"} - ${song.artists || "Unknown Artist"}`;
      });

      resultMessage += '\n\nReply with the number of the song you want to download (e.g., 1, 2, 3...)';

      return api.sendMessage(resultMessage, event.threadID, async (messageInfo) => {
        // Wait for the user to reply with a song number
        const userReply = (eventReply) => {
          const songNumber = parseInt(eventReply.body);
          if (songNumber >= 1 && songNumber <= 5) {
            const selectedSong = results[songNumber - 1];
            const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${encodeURIComponent(selectedSong.link)}`;

            // Get the download link and send it
            api.sendMessage(`🎶 Song: ${selectedSong.name} by ${selectedSong.artists}\nDownload: ${downloadUrl}`, event.threadID);
          } else {
            api.sendMessage('🚫 Invalid song number! Please reply with a valid number from the list.', event.threadID, messageInfo.messageID);
          }
        };

        api.listenMutes(event.threadID, userReply);
      });
    } catch (error) {
      console.error(`Error in Spotify command: ${error.message}`);
      return api.sendMessage('🚫 There was an error while searching for the song. Please try again later.', event.threadID, event.messageID);
    }
  },
};
