const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "spotify",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Nayan (Modified by Adi)",
    description: "Download music from Spotify by URL or search",
    commandCategory: "Media",
    usages: "[spotify url|search]",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    try {
      const selectedIndex = parseInt(event.body) - 1;
      const songData = handleReply.results[selectedIndex];

      if (!songData) return api.sendMessage("⚠ Invalid selection.", event.threadID, event.messageID);

      const res = await axios.get(`https://nayan-video-downloader.vercel.app/spotifyDl?url=${songData.link}`);
      const { title, artistNames, duration, download_url } = res.data.data;

      const filePath = path.join(__dirname, "cache", `${title}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const fileStream = await axios({
        url: download_url,
        method: "GET",
        responseType: "stream"
      });
      fileStream.data.pipe(writer);

      writer.on("finish", async () => {
        const fileSize = fs.statSync(filePath).size;
        if (fileSize > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage("⚠ The file is too large to send (over 25MB).", event.threadID, event.messageID);
        }

        api.unsendMessage(handleReply.messageID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        api.sendMessage(
          {
            body: `🎵 Title: ${title}\n🎤 Artist(s): ${artistNames.join(", ")}\n⏳ Duration: ${duration}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      });
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ Error while processing your request. Try again later.", event.threadID, event.messageID);
    }
  },

  run: async function ({ api, event, args }) {
    const input = args.join(" ");
    if (!input) {
      return api.sendMessage("⚠ Please provide a Spotify URL or search keyword.", event.threadID, event.messageID);
    }

    if (input.startsWith("https://open.spotify.com/")) {
      try {
        const res = await axios.get(`https://nayan-video-downloader.vercel.app/spotifyDl?url=${input}`);
        const { title, artistNames, duration, download_url } = res.data.data;

        api.setMessageReaction("⌛", event.messageID, () => {}, true);

        const filePath = path.join(__dirname, "cache", `${title}.mp3`);
        const writer = fs.createWriteStream(filePath);

        const fileStream = await axios({
          url: download_url,
          method: "GET",
          responseType: "stream"
        });
        fileStream.data.pipe(writer);

        writer.on("finish", async () => {
          const fileSize = fs.statSync(filePath).size;
          if (fileSize > 26214400) {
            fs.unlinkSync(filePath);
            return api.sendMessage("⚠ The file is too large to send (over 25MB).", event.threadID, event.messageID);
          }

          api.setMessageReaction("✅", event.messageID, () => {}, true);

          api.sendMessage(
            {
              body: `🎵 Title: ${title}\n🎤 Artist(s): ${artistNames.join(", ")}\n⏳ Duration: ${duration}`,
              attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => fs.unlinkSync(filePath),
            event.messageID
          );
        });
      } catch (error) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("❌ Failed to download the song. Please check the URL and try again.", event.threadID, event.messageID);
      }
    } else {
      try {
        const res = await axios.get(`https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(input)}&limit=5`);
        const results = res.data.results;

        if (!results.length) {
          return api.sendMessage("⚠ No results found for your search.", event.threadID, event.messageID);
        }

        let message = "🔎 Search Results:\n\n";
        results.forEach((song, index) => {
          message += `${index + 1}. ${song.name} by ${song.artists.join(", ")}\n\n`;
        });
        message += "Reply with the number to select a song to download.";

        api.sendMessage(
          { body: message },
          event.threadID,
          (error, info) => {
            global.client.handleReply.push({
              type: "reply",
              name: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              results
            });
          },
          event.messageID
        );
      } catch (error) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("❌ Failed to search for the song. Please try again later.", event.threadID, event.messageID);
      }
    }
  }
};
