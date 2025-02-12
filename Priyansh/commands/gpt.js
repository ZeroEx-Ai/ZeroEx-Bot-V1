const fs = require("fs");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
    name: "gpt",
    version: "1.0",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Chat with GPT or generate an image",
    commandCategory: "Ai",
    usages: "[text]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    try {
        if (args.length === 0) {
            return api.sendMessage("⚠️ Please enter a prompt!", event.threadID, event.messageID);
        }

        const prompt = args.join(" ");
        api.sendMessage("⏳ Processing your request...", event.threadID, event.messageID);

        // GPT API Request
        const { data } = await axios.post("https://nayan-gpt4.onrender.com/gpt4", { prompt });

        if (!data.data.response) {
            // Image Processing
            const imgUrl = data.data.imgUrl;
            const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
            const image = await jimp.read(response.data);
            const outputPath = "./dalle3.png";

            await image.writeAsync(outputPath);
            const attachment = fs.createReadStream(outputPath);

            await api.sendMessage(
                {
                    body: `🖼️ Here is your generated image: "${prompt}"`,
                    attachment,
                },
                event.threadID,
                event.messageID
            );

            fs.unlinkSync(outputPath);
        } else {
            // Text Response
            api.sendMessage(data.data.response, event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("❌ An error occurred while processing your request.", event.threadID, event.messageID);
    }
};
