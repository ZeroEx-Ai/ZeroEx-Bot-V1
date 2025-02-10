const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "spotify",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Search and download Spotify tracks",
    commandCategory: "music",
    usages: "/spotify [song name]",
    cooldowns: 5
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
    const { threadID, messageID, body } = event;

    try {
        // Delete the original list message
        api.unsendMessage(handleReply.messageID);

        const selectedNumber = parseInt(body.trim());
        if (isNaN(selectedNumber) throw new Error("Invalid number");
        
        const trackIndex = selectedNumber - 1;
        if (trackIndex < 0 || trackIndex >= handleReply.tracks.length) throw new Error("Number out of range");

        const selectedTrack = handleReply.tracks[trackIndex];
        
        // Send downloading status
        api.sendMessage("⬇️ Downloading audio...", threadID, messageID);

        // Get download URL
        const downloadResponse = await axios.get(
            "https://nayan-video-downloader.vercel.app/spotifyDl", 
            { params: { url: selectedTrack.link } }
        );

        const audioUrl = downloadResponse.data.downloadUrl;
        const audioFileName = `spotify_${Date.now()}.mp3`;
        const cachePath = path.join(__dirname, 'cache', audioFileName);

        // Download and save audio
        const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(cachePath);
        audioResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Send audio file
        const message = {
            body: `🎧 Now Playing:\n\n🎵 Title: ${selectedTrack.name}\n👤 Artist: ${selectedTrack.artists}`,
            attachment: fs.createReadStream(cachePath)
        };

        api.sendMessage(message, threadID, () => {
            // Delete cached audio after sending
            fs.unlinkSync(cachePath);
        }, messageID);

    } catch (error) {
        console.error("Error in reply handler:", error);
        api.sendMessage("❌ Error processing your request. Please try again.", threadID, messageID);
    }
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

        let message = "🎵 Spotify Search Results:\n\n";
        data.results.forEach((track, index) => {
            message += `${index + 1}. ${track.name}\n   Artist: ${track.artists}\n\n`;
        });
        message += "\n🔢 Reply with the number of the track you want to download";

        api.sendMessage(message, threadID, (error, info) => {
            if (!error) {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    tracks: data.results
                });
            }
        }, messageID);

    } catch (error) {
        console.error("Error in Spotify command:", error);
        api.sendMessage("⚠️ Error processing your request. Please try again later.", threadID, messageID);
    }
};
