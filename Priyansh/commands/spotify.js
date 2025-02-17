const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
    name: "spotify",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Modified by Adi",
    description: "Search and download songs from Spotify",
    commandCategory: "Media",
    usages: "/spotify [song name or URL]",
    cooldowns: 5,
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
    const { threadID, messageID, body } = event;
    const selectedIndex = parseInt(body) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= handleReply.results.length) {
        return api.sendMessage("❌ Invalid selection. Please enter a valid number.", threadID, messageID);
    }

    const track = handleReply.results[selectedIndex];
    const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${track.link}`;
    const filePath = `${__dirname}/cache/${track.name}.mp3`;

    try {
        api.sendMessage(`⬇️ Downloading **${track.name}** by **${track.artists}**...`, threadID, messageID);

        const writer = fs.createWriteStream(filePath);
        const response = await axios({
            url: downloadUrl,
            method: "GET",
            responseType: "stream",
        });

        response.data.pipe(writer);

        writer.on("finish", async () => {
            const fileSize = fs.statSync(filePath).size;
            if (fileSize > 26214400) {
                fs.unlinkSync(filePath);
                return api.sendMessage("⚠️ The file is too large to send (over 25MB).", threadID, messageID);
            }

            api.unsendMessage(handleReply.messageID);

            api.sendMessage(
                {
                    body: `🎵 **Title:** ${track.name}\n🎤 **Artist(s):** ${track.artists}\n`,
                    attachment: fs.createReadStream(filePath),
                },
                threadID,
                () => fs.unlink(filePath),
                messageID
            );
        });
    } catch (error) {
        console.error("❌ Error downloading song:", error);
        api.sendMessage("⚠️ Failed to download the song. Please try again later.", threadID, messageID);
    }
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const input = args.join(" ");

    if (!input) {
        return api.sendMessage("🔍 Please provide a song name or a Spotify URL.", threadID, messageID);
    }

    // **Direct Download from URL**
    if (input.startsWith("https://open.spotify.com/")) {
        try {
            const response = await axios.get(`https://nayan-video-downloader.vercel.app/spotifyDl?url=${input}`);
            const track = response.data.data;
            const filePath = `${__dirname}/cache/${track.title}.mp3`;

            api.sendMessage(`⬇️ Downloading **${track.title}** by **${track.artistNames.join(", ")}**...`, threadID, messageID);

            const writer = fs.createWriteStream(filePath);
            const fileStream = await axios({
                url: track.download_url,
                method: "GET",
                responseType: "stream",
            });

            fileStream.data.pipe(writer);

            writer.on("finish", async () => {
                const fileSize = fs.statSync(filePath).size;
                if (fileSize > 26214400) {
                    fs.unlinkSync(filePath);
                    return api.sendMessage("⚠️ The file is too large to send (over 25MB).", threadID, messageID);
                }

                api.sendMessage(
                    {
                        body: `🎵 **Title:** ${track.title}\n🎤 **Artist(s):** ${track.artistNames.join(", ")}\n`,
                        attachment: fs.createReadStream(filePath),
                    },
                    threadID,
                    () => fs.unlink(filePath),
                    messageID
                );
            });
        } catch (error) {
            console.error("❌ Error downloading song:", error);
            api.sendMessage("⚠️ Failed to download the song. Please check the URL and try again.", threadID, messageID);
        }
        return;
    }

    // **Search for Songs**
    try {
        const response = await axios.get(`https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(input)}&limit=5`);
        const results = response.data.results;

        if (!results.length) {
            return api.sendMessage("❌ No results found for your search.", threadID, messageID);
        }

        let message = "🎶 **Spotify Search Results:**\n\n";
        results.forEach((track, index) => {
            message += `${index + 1}. **${track.name}**\n   🎤 Artist: ${track.artists}\n   🔗 Link: ${track.link}\n\n`;
        });

        message += "🔢 **Reply with a number to download your desired song.**";

        api.sendMessage(
            {
                body: message,
            },
            threadID,
            (err, info) => {
                global.client.handleReply.push({
                    type: "reply",
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    results,
                });
            },
            messageID
        );
    } catch (error) {
        console.error("❌ Error searching songs:", error);
        api.sendMessage("⚠️ Failed to search for the song. Please try again later.", threadID, messageID);
    }
};
