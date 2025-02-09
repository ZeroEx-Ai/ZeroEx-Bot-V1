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
      return api.sendMessage('❓ Please provide a song name to search on Spotify.', event.threadID, event.messageID);
    }

    try {
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(songName)}&limit=5`;
      const searchResponse = await axios.get(searchUrl);
      const results = searchResponse.data.results;

      if (!results || results.length === 0) {
        return api.sendMessage('🚫 No songs found. Please try a different search.', event.threadID, event.messageID);
      }

      let resultMessage = '🔍 Here are 5 songs found:\n';
      results.forEach((song, index) => {
        resultMessage += `\n${index + 1}. ${song.name} - ${song.artists}`;
      });

      resultMessage += '\n\nReply with the number of the song you want to download (e.g., 1, 2, 3...)';

      api.sendMessage(resultMessage, event.threadID, (messageInfo) => {
        const replyListener = async (eventReply) => {
          const songNumber = parseInt(eventReply.body);
          if (songNumber >= 1 && songNumber <= 5) {
            const selectedSong = results[songNumber - 1];
            const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${encodeURIComponent(selectedSong.link)}`;

            try {
              const downloadResponse = await axios.get(downloadUrl);
              const audioUrl = downloadResponse.data.download_url;

              if (audioUrl) {
                api.sendMessage(
                  {
                    attachment: audioUrl,
                    body: `🎶 Here is your song: ${selectedSong.name}`,
                  },
                  event.threadID
                );
              } else {
                api.sendMessage('❌ Failed to fetch the audio file. Please try again later.', event.threadID);
              }
            } catch (error) {
              console.error('Error fetching the audio file:', error);
              api.sendMessage('❌ Error occurred while downloading the audio file. Please try again later.', event.threadID);
            }
          } else {
            api.sendMessage('🚫 Invalid song number! Please reply with a valid number from the list.', event.threadID, messageInfo.messageID);
          }
        };

        api.listenMutes(event.threadID, replyListener);
      });
    } catch (error) {
      console.error(`Error in Spotify command: ${error.message}`);
      return api.sendMessage('🚫 There was an error while searching for the song. Please try again later.', event.threadID, event.messageID);
    }
  },
};
