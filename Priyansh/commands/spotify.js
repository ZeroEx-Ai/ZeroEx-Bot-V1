const axios = require("axios");

module.exports.config = {
    name: "spotify",
    version: "1.0",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Search for songs on Spotify and provide a download link",
    commandCategory: "music",
    usages: "[song name]",
    cooldowns: 5,
};

module.exports.handleEvent = async function ({ api, event, args }) {
    try {
        if (args.length === 0) {
            return api.sendMessage("⚠️ Please enter a song name to search!", event.threadID, event.messageID);
        }

        const songName = args.join(" ");
        api.sendMessage("⏳ Searching for songs...", event.threadID, event.messageID);

        // API Request for Spotify search
        const { data } = await axios.get(`https://nayan-video-downloader.vercel.app/spotify-search?name=${songName}&limit=5`);

        if (data.status !== 200 || data.results.length === 0) {
            return api.sendMessage("❌ No results found. Please try again with a different song name.", event.threadID, event.messageID);
        }

        let message = `Here are the top 5 results for "${songName}":\n\n`;
        data.results.forEach((track, index) => {
            message += `${index + 1}. ${track.name} by ${track.artists}\n`;
        });

        message += "\nReply with the number of the song you want to download.";

        api.sendMessage(message, event.threadID, event.messageID);

        // Handle user response with number to download the song
        api.listenMqtt(async (replyEvent) => {
            if (replyEvent.threadID === event.threadID && replyEvent.messageID !== event.messageID) {
                const replyText = replyEvent.body.trim();
                const songIndex = parseInt(replyText) - 1;

                if (songIndex >= 0 && songIndex < data.results.length) {
                    const selectedSong = data.results[songIndex];
                    const downloadLink = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${selectedSong.link}`;

                    api.sendMessage(
                        `🎶 You selected: "${selectedSong.name}" by ${selectedSong.artists}\nDownload link: ${downloadLink}`,
                        event.threadID,
                        event.messageID
                    );
                } else {
                    api.sendMessage("⚠️ Invalid number. Please select a valid number from the list.", event.threadID, event.messageID);
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("❌ An error occurred while processing your request.", event.threadID, event.messageID);
    }
};
