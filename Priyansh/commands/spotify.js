const axios = require('axios');

module.exports.config = {
    name: "spotify",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Search Spotify tracks",
    commandCategory: "music",
    usages: "/spotify [song name]",
    cooldowns: 5
};

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
        data.results.forEach((track, index) => {
            message += `${index + 1}. ${track.name}\n   Artist: ${track.artists}\n   Link: ${track.link}\n\n`;
        });

        message += `\n🔢 Reply with the number to choose a track`;
        
        api.sendMessage(message, threadID, messageID);

    } catch (error) {
        console.error("Error in Spotify command:", error);
        api.sendMessage("⚠️ Error processing your request. Please try again later.", threadID, messageID);
    }
};
