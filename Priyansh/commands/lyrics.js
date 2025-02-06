const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
    name: 'lyrics',
    version: '2.0.0',
    hasPermssion: 0,
    credits: 'Adi.0X',
    description: 'lyrics of a songs',
    commandCategory: 'media',
    usages: 'lyrics [song name]',
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const songName = args.join(' ');

        // Fetch lyrics using lyrics.ovh API
        const lyricsResponse = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(songName)}`);
        const lyricsData = lyricsResponse.data;

        // Format the lyrics into a message
        const messageBody = `
❏ Title: ${songName}

❏ Lyrics:
${lyricsData.lyrics || 'No lyrics found for this song.'}

❏ Contact: https://www.facebook.com/Adi.0X
`;

        // Send the lyrics as a message
        return api.sendMessage({
            body: messageBody
        }, event.threadID);
    } catch (error) {
        console.error(error);
        return api.sendMessage('An error occurred while fetching lyrics.', event.threadID);
    }
};
