const axios = require('axios');
const userStates = new Map();

module.exports = {
  config: {
    name: 'spotify',
    version: '1.0.1',
    hasPermssion: 0,
    credits: 'Your Name',
    description: 'Search and download Spotify songs',
    commandCategory: 'Media',
    usages: '[songName]',
    cooldowns: 5,
    dependencies: { 'axios': '' },
  },

  run: async function ({ api, event, args }) {
    const songName = args.join(' ');

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
      resultMessage += '\n\nReply with the **number** of the song you want to download (1-5).';

      await api.sendMessage(resultMessage, event.threadID);
      userStates.set(`${event.threadID}_${event.senderID}`, results);

    } catch (error) {
      console.error('Error searching:', error);
      api.sendMessage('🚫 Error occurred while searching. Please try again later.', event.threadID, event.messageID);
    }
  },

  handleEvent: async function ({ api, event }) {
    const key = `${event.threadID}_${event.senderID}`;
    const results = userStates.get(key);

    if (!results || event.type !== 'message' || event.body === undefined) return;

    const songNumber = parseInt(event.body.trim());
    if (isNaN(songNumber) || songNumber < 1 || songNumber > 5) return;

    userStates.delete(key); // Clear the state immediately

    try {
      api.sendMessage('⏳ Downloading your song, please wait...', event.threadID);

      const selectedSong = results[songNumber - 1];
      const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${encodeURIComponent(selectedSong.link)}`;
      const downloadResponse = await axios.get(downloadUrl);
      const audioUrl = downloadResponse.data.download_url;

      if (!audioUrl) throw new Error('No download URL found');

      const audioStream = await axios.get(audioUrl, { responseType: 'stream' });
      await api.sendMessage({
        attachment: audioStream.data,
        body: `🎶 Here is your song: ${selectedSong.name}`
      }, event.threadID);

    } catch (error) {
      console.error('Download error:', error);
      api.sendMessage('❌ Failed to download the song. Please try again later.', event.threadID);
    }
  }
};
