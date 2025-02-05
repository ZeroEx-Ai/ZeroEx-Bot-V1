const fs = require("fs");
const axios = require("axios");
const jimp = require("jimp");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "gpt",
    version: "0.0.2",
    hasPermssion: 0,
    credits: "Nayan",
    description: "Chat with GPT",
    commandCategory: "user",
    usages: "",
    cooldowns: 5,
  },

  run: async function ({ api, events, args }) {
    try {
      const prompt = args.join(" ");
      const { data } = await axios.post("https://nayan-gpt4.onrender.com/gpt4", { prompt });

      if (data.data.imgUrl) {
        const imgUrl = data.data.imgUrl;
        const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
        const image = await jimp.read(response.data);

        const outputPath = path.join(os.tmpdir(), "dalle3.png");
        await image.writeAsync(outputPath);

        const attachment = fs.createReadStream(outputPath);
        await api.sendMessage(
          { body: `🖼️ Here is your generated image: "${prompt}"`, attachment },
          events.threadID,
          events.messageID
        );

        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } else {
        api.sendMessage(data.data.response || "No response received.", events.threadID, events.messageID);
      }
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred while processing your request.", events.threadID, events.messageID);
    }
  },
};
