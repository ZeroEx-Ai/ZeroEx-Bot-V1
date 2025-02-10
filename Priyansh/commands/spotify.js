const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "spotify",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Search and download Spotify tracks",
    commandCategory: "music",
    usages: "/spotify [song name]",
    cooldowns: 5
};

const searchResults = {}; // Store search results temporarily

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;

    if (!args[0]) {
        return api.sendMessage("🔍 Please enter a song name to search:", threadID, messageID);
    }

    try {
        const searchQuery = args.join(" ");
        const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${searchQuery}&limit=5`;
        
        const response = await axios.get(searchUrl);
        const data = response.data;

        if (!data.results || data.results.length === 0) {
            return api.sendMessage("❌ No results found for your search.", threadID, messageID);
        }

        let message = `🎵 Spotify Search Results:\n\n`;
        searchResults[threadID] = data.results; // Store search results for this thread

        data.results.forEach((track, index) => {
            message += `${index + 1}. ${track.name}\n   🎤 Artist: ${track.artists}\n   🔗 Link: ${track.link}\n\n`;
        });

        message += `\n🔢 Reply with the number to choose a track`;

        api.sendMessage(message, threadID, (err, info) => {
            if (!err) {
                searchResults[threadID].messageID = info.messageID; // Store message ID for deletion
            }
        });

    } catch (error) {
        console.error("Error in Spotify command:", error);
        api.sendMessage("⚠️ Error processing your request. Please try again later.", threadID, messageID);
    }
};

// Listen for user replies
module.exports.handleEvent = async ({ api, event }) => {
    const { threadID, messageID, body } = event;

    if (!searchResults[threadID] || !/^\d+$/.test(body)) return;
    
    const index = parseInt(body) - 1;
    const track = searchResults[threadID][index];

    if (!track) return api.sendMessage("❌ Invalid selection. Please choose a valid number.", threadID, messageID);

    // Delete the list message
    if (searchResults[threadID].messageID) {
        api.unsendMessage(searchResults[threadID].messageID);
    }

    const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${track.link}`;
    const filePath = path.join(__dirname, 'cache', `${threadID}.mp3`);

    try {
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({ 
                body: `🎶 Now playing: ${track.name}\n👤 Artist: ${track.artists}`, 
                attachment: fs.createReadStream(filePath) 
            }, threadID, () => {
                fs.unlinkSync(filePath); // Auto-delete after sending
            });

            delete searchResults[threadID]; // Clear stored data
        });

    } catch (error) {
        console.error("Error downloading track:", error);
        api.sendMessage("⚠️ Error downloading the track. Please try again later.", threadID, messageID);
    }
};

module.exports.handleReply = module.exports.handleEvent;
