const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createReadStream, unlinkSync } = require("fs-extra");

module.exports = {
  config: {
    name: "spotify",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Nayan",
    description: "Download music from Spotify by URL or search",
    commandCategory: "Media",
    usages: "spotify [url|search]",
    cooldowns: 5,
    dependencies: {
      axios: "",
      "fs-extra": ""
    }
  },

  // এই ফাংশনটি সরাসরি ইউজারের কমান্ড গ্রহণ করলে চলবে
  run: async function ({ api, event, args }) {
    const input = args.join(" ");
    if (!input) {
      return api.sendMessage(
        "Please provide a Spotify URL or a search keyword.",
        event.threadID,
        event.messageID
      );
    }

    // cache ফোল্ডার চেক ও তৈরি
    const downloadDir = path.join(__dirname, "cache");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // যদি সরাসরি Spotify URL দেওয়া হয়
    if (input.startsWith("https://open.spotify.com/")) {
      try {
        api.setMessageReaction("⌛", event.messageID, () => {}, true);

        const response = await axios.get(
          `https://nayan-video-downloader.vercel.app/spotifyDl?url=${input}`
        );
        const { title, artistNames, duration, download_url } = response.data.data;

        const safeTitle = title.replace(/[^a-zA-Z0-9 \-_]/g, "");
        const filePath = path.join(downloadDir, `${safeTitle}.mp3`);

        const writer = fs.createWriteStream(filePath);
        const fileStream = await axios({
          url: download_url,
          method: "GET",
          responseType: "stream"
        });
        fileStream.data.pipe(writer);

        writer.on("finish", async () => {
          const fileSize = fs.statSync(filePath).size;
          // 25MB = 26214400 bytes
          if (fileSize > 26214400) {
            api.sendMessage(
              "The file is too large to send (over 25MB).",
              event.threadID,
              event.messageID
            );
            unlinkSync(filePath);
            return;
          }

          api.setMessageReaction("✅", event.messageID, () => {}, true);
          api.sendMessage(
            `🎵 Title: ${title}\n🎤 Artist(s): ${artistNames.join(", ")}\n⏱ Duration: ${duration}\n`,
            event.threadID,
            () => {
              api.sendMessage(
                { attachment: createReadStream(filePath) },
                event.threadID,
                () => unlinkSync(filePath),
                event.messageID
              );
            },
            event.messageID
          );
        });
      } catch (error) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage(
          "Failed to download the song. Please check the URL and try again.",
          event.threadID,
          event.messageID
        );
      }
    } else {
      // Search mode
      try {
        api.setMessageReaction("⌛", event.messageID, () => {}, true);
        const response = await axios.get(
          `https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(
            input
          )}&limit=5`
        );
        const results = response.data.results;
        if (!results.length) {
          return api.sendMessage(
            "No results found for your search.",
            event.threadID,
            event.messageID
          );
        }

        let message = "🎧 Search Results:\n\n";
        results.forEach((song, index) => {
          message += `${index + 1}. ${song.name} by ${song.artists}\n\n`;
        });
        message += "Reply with the number of the song you want to download.";

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        // পাঠানোর পর handleReply-এর জন্য global client-এ পুশ করতে হবে
        api.sendMessage(
          { body: message },
          event.threadID,
          (err, info) => {
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
        return api.sendMessage(
          "Failed to search for the song. Please try again later.",
          event.threadID,
          event.messageID
        );
      }
    }
  },

  // handleReply: ইউজারের রেপ্লাই পেলে চলবে (যখন সার্চের ফলাফল থেকে গান নির্বাচন করা হবে)
  handleReply: async function ({ api, event, handleReply }) {
    try {
      const index = parseInt(event.body) - 1;
      if (isNaN(index) || index < 0 || index >= handleReply.results.length) {
        return api.sendMessage(
          "Invalid selection. Please enter a valid number from the search results.",
          event.threadID,
          event.messageID
        );
      }
      const songData = handleReply.results[index];

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const response = await axios.get(
        `https://nayan-video-downloader.vercel.app/spotifyDl?url=${songData.link}`
      );
      const { title, artistNames, duration, download_url } = response.data.data;

      const safeTitle = title.replace(/[^a-zA-Z0-9 \-_]/g, "");
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }
      const filePath = path.join(downloadDir, `${safeTitle}.mp3`);

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
          api.sendMessage(
            "The file is too large to send (over 25MB).",
            event.threadID,
            event.messageID
          );
          return unlinkSync(filePath);
        }

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage(
          `🎵 Title: ${title}\n🎤 Artist(s): ${artistNames.join(
            ", "
          )}\n⏱ Duration: ${duration}\n`,
          event.threadID,
          () => {
            api.sendMessage(
              { attachment: createReadStream(filePath) },
              event.threadID,
              () => unlinkSync(filePath),
              event.messageID
            );
          },
          event.messageID
        );
      });
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "An error occurred while processing your request. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
