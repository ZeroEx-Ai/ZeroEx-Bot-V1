const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "spotify",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Adi.0X",
    description: "Search and download songs from Spotify",
    commandCategory: "Media",
    usages: "[song name]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        "❌ Please provide a song name. Example: /spotify Ghum",
        event.threadID,
        event.messageID
      );
    }

    const songName = args.join(" ");
    const searchUrl = `https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(songName)}&limit=5`;

    try {
      const response = await axios.get(searchUrl);
      if (!response.data || !response.data.results.length) {
        return api.sendMessage("❌ No songs found!", event.threadID, event.messageID);
      }

      let message = "🎵 **Select a song by replying with its number:**\n\n";
      response.data.results.forEach((song) => {
        message += `${song.index}. ${song.name} - ${song.artists}\n`;
      });

      api.sendMessage(message, event.threadID, (err, info) => {
        if (err) return console.error(err);

        global.client.handleReply.push({
          type: "spotify-select",
          name: this.config.name,
          messageID: info.messageID,
          results: response.data.results,
          author: event.senderID,
        });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to fetch songs!", event.threadID, event.messageID);
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (handleReply.type === "spotify-select" && event.senderID === handleReply.author) {
      const selectedIndex = parseInt(event.body);
      const selectedSong = handleReply.results.find((song) => song.index === selectedIndex);

      if (!selectedSong) {
        return api.sendMessage("❌ Invalid selection!", event.threadID, event.messageID);
      }

      api.sendMessage(`⏳ Downloading: ${selectedSong.name} - ${selectedSong.artists}`, event.threadID);

      const downloadUrl = `https://nayan-video-downloader.vercel.app/spotifyDl?url=${encodeURIComponent(selectedSong.link)}`;

      try {
        const downloadResponse = await axios.get(downloadUrl);
        if (!downloadResponse.data || !downloadResponse.data.downloadUrl) {
          return api.sendMessage("❌ Download failed!", event.threadID, event.messageID);
        }

        const fileUrl = downloadResponse.data.downloadUrl;
        const filename = `${selectedSong.name.replace(/[^a-zA-Z0-9 \-_]/g, "")}.mp3`;
        const filePath = path.join(__dirname, "cache", filename);

        if (!fs.existsSync(path.join(__dirname, "cache"))) {
          fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
        }

        const file = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          https.get(fileUrl, (response) => {
            if (response.statusCode === 200) {
              response.pipe(file);
              file.on("finish", () => {
                file.close(resolve);
              });
            } else {
              reject(new Error(`Download failed. Status code: ${response.statusCode}`));
            }
          }).on("error", (error) => {
            fs.unlinkSync(filePath);
            reject(error);
          });
        });

        await api.sendMessage(
          {
            attachment: fs.createReadStream(filePath),
            body: `🎶 Here is your song:\n**${selectedSong.name}** - ${selectedSong.artists}`,
          },
          event.threadID,
          () => fs.unlinkSync(filePath)
        );
      } catch (error) {
        console.error(error);
        api.sendMessage("❌ Failed to download song!", event.threadID, event.messageID);
      }
    }
  },
};
