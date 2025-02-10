const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const searchAPI = "https://nayan-video-downloader.vercel.app/spotify-search?name=";
const downloadAPI = "https://nayan-video-downloader.vercel.app/spotifyDl?url=";

// Store user-selected songs temporarily
const userSelections = {};

module.exports = {
  config: {
    name: "Spotify",
    version: "1.1.0",
    hasPermission: 0,
    credits: "ZeroEx-0X",
    description: "Search and download Spotify songs",
    commandCategory: "Music",
    usages: "/Spotify [song name]",
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // If no song name is provided, ask for one
    if (args.length === 0) {
      return api.sendMessage("🎵 Please enter a song name:", threadID, messageID);
    }

    // Get the song name from user input
    const songName = args.join(" ");

    // Send processing message
    const processingMsg = await api.sendMessage(`🔍 Searching for "${songName}"...`, threadID, messageID);

    try {
      // Search for songs
      const searchRes = await axios.get(`${searchAPI}${encodeURIComponent(songName)}&limit=5`);
      const songs = searchRes.data.results; // Corrected path

      // Check if results exist
      if (!songs || songs.length === 0) {
        return api.sendMessage("❌ No songs found. Please try again with a different name.", threadID, messageID);
      }

      // Store search results for the user
      userSelections[senderID] = songs;

      // Create response message with song list
      let response = "🔍 Here are 5 songs found:\n\n";
      songs.forEach((song, index) => {
        response += `${index + 1}. ${song.title} - ${song.artist} (${song.year || "Unknown"})\n`;
      });
      response += "\nReply with the number of the song you want (e.g., 1, 2, 3...)";

      // Send song list & enable reply handling
      return api.sendMessage(response, threadID, (err, info) => {
        userSelections[`${senderID}_messageID`] = info.messageID; // Save message ID for reference
      });

    } catch (error) {
      console.error("Spotify Search Error:", error.message);
      return api.sendMessage("⚠️ Error searching for the song. Please try again later.", threadID, messageID);
    }
  },

  handleReply: async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;

    // Ensure there are stored selections for this user
    if (!userSelections[senderID]) {
      return api.sendMessage("❌ No song selection found. Please start again using /Spotify [song name].", threadID, messageID);
    }

    const songs = userSelections[senderID];

    // Check if the user replied with a valid number
    const songIndex = parseInt(body.trim());
    if (isNaN(songIndex) || songIndex < 1 || songIndex > songs.length) {
      return api.sendMessage("⚠️ Invalid selection. Please reply with a number from 1 to 5.", threadID, messageID);
    }

    // Get the selected song
    const selectedSong = songs[songIndex - 1];
    const trackUrl = selectedSong.url; // Spotify track link

    // Send processing message
    const processingMsg = await api.sendMessage("🎶 Downloading your song, please wait...", threadID, messageID);

    try {
      // Get download link
      const downloadRes = await axios.get(`${downloadAPI}${encodeURIComponent(trackUrl)}`);
      const downloadUrl = downloadRes.data.downloadUrl;

      // Validate the download link
      if (!downloadUrl) {
        return api.sendMessage("❌ Failed to get the download link. Try another song.", threadID, messageID);
      }

      // Define file paths
      const safeTitle = selectedSong.title.replace(/[^a-zA-Z0-9 \-_]/g, "");
      const filename = `${safeTitle}.mp3`;
      const downloadDir = path.join(__dirname, "cache");
      const downloadPath = path.join(downloadDir, filename);

      // Ensure the directory exists
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      // Download and save the file
      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      // Send the audio file
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎵 **Title:** ${selectedSong.title}\n🎤 **Artist:** ${selectedSong.artist}\n📅 **Release Year:** ${selectedSong.year || "Unknown"}`
        },
        threadID,
        () => {
          fs.unlinkSync(downloadPath); // Cleanup
          api.unsendMessage(processingMsg.messageID);
        },
        messageID
      );

      // Remove user selection after download
      delete userSelections[senderID];

    } catch (error) {
      console.error("Spotify Download Error:", error.message);
      return api.sendMessage("⚠️ Failed to download the song. Try again later.", threadID, messageID);
    }
  }
};
