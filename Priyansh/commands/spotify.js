const axios = require('axios');

module.exports = {
  config: {
    name: 'spotify',
    version: '1.0.1',
    hasPermssion: 0,
    credits: 'Developer Name',
    description: 'Search and download Spotify songs',
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
      const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${songName}&limit=5`;
      const searchResponse = await axios.get(searchUrl);
      const results = searchResponse.data.results;

      if (!results || results.length === 0) {
        return api.sendMessage('🚫 No songs found. Please try a different search.', event.threadID, event.messageID);
      }

      let resultMessage = '🔍 Here are 5 songs found:\n';
      results.forEach((song, index) => {
        resultMessage += `\n${index + 1}. ${song.name} - ${song.artists}`;
      });

      resultMessage += '\n\nReply with the **number** of the song you want to download (1-5).';

      api.sendMessage(resultMessage, event.threadID, (err, messageInfo) => {
        if (err) return console.error(err);

        const listener = api.listenMqtt(async (reply) => {
          if (reply.senderID !== event.senderID || reply.threadID !== event.threadID) return;
          const songNumber = parseInt(reply.body.trim());

          if (!songNumber || songNumber < 1 || songNumber > 5) {
            return api.sendMessage('❌ Invalid selection! Please reply with a number between 1-5.', event.threadID);
          }

          api.sendMessage('⏳ Downloading your song, please wait...', event.threadID);
          api.removeListener(listener); // Remove listener after getting reply

          const selectedSong = results[songNumber - 1];
          const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${selectedSong.link}`;

          try {
            const downloadResponse = await axios.get(downloadUrl);
            const audioUrl = downloadResponse.data.download_url;

            if (audioUrl) {
              api.sendMessage(
                {
                  attachment: await axios({ url: audioUrl, responseType: 'stream' }),
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
        });
      });
    } catch (error) {
      console.error(`Error in Spotify command: ${error.message}`);
      return api.sendMessage('🚫 There was an error while searching for the song. Please try again later.', event.threadID, event.messageID);
    }
  },
};
