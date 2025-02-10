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
        const number = parseInt(body.trim());
        if (isNaN(number) || number < 1 || number > handleReply.songs.length) {
            return api.sendMessage("⚠️ Invalid number! Please reply with a valid number from the list.", threadID, messageID);
        }

        const selectedTrack = handleReply.songs[number - 1];
        api.sendMessage("⏳ Downloading your track...", threadID, messageID);

        // Download track using the download API
        const downloadResponse = await axios.get(handleReply.downloadApi, {
            params: {
                url: selectedTrack.trackUrl
            }
        });

        const audioUrl = downloadResponse.data.downloadUrl; // Adjust according to your API response structure
        const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        const audioPath = path.join(cacheDir, `spotify_${Date.now()}.mp3`);
        const writer = fs.createWriteStream(audioPath);
        audioResponse.data.pipe(writer);

        writer.on('finish', () => {
            const message = {
                body: `🎧 Now Playing:\n\n🎵 Title: ${selectedTrack.name}\n👤 Artist: ${selectedTrack.artist}\n📅 Year: ${selectedTrack.year || 'N/A'}`,
                attachment: fs.createReadStream(audioPath)
            };
            
            api.sendMessage(message, threadID, () => fs.unlinkSync(audioPath), messageID);
        });

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Error downloading the track. Please try again later.", threadID, messageID);
    }
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    
    if (!args[0]) {
        return api.sendMessage("🎵 Please enter a song name to search:", threadID, messageID);
    }

    try {
        const searchQuery = args.join(" ");
        const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${searchQuery}&limit=5`;

        const response = await axios.get(searchUrl);
        const tracks = response.data.data; // Adjust according to your API response structure

        if (!tracks || tracks.length === 0) {
            return api.sendMessage("🔍 No results found for your search.", threadID, messageID);
        }

        let message = "🎵 Search Results:\n\n";
        tracks.forEach((track, index) => {
            message += `${index + 1}. ${track.name} - ${track.artist}\n`;
        });
        message += "\n🔢 Reply with the number of the track you want to download";

        api.sendMessage(message, threadID, (error, info) => {
            if (!error) {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    songs: tracks,
                    downloadApi: "https://nayan-video-downloader.vercel.app/spotifyDl"
                });
            }
        }, messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Error searching for tracks. Please try again later.", threadID, messageID);
    }
};
