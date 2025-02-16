const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "emojimix",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Mix two emojis together",
    commandCategory: "Fun",
    usages: "/emojimix 😂 😡",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    // Check format validation
    if (args.length < 2) {
        return api.sendMessage(
            `⚠️ Invalid format! Usage: ${this.config.usages}`,
            threadID,
            messageID
        );
    }

    // Extract emojis
    const [emoji1, emoji2] = args.slice(0, 2).map(e => encodeURIComponent(e));
    
    // Validate emojis using Unicode property escape
    const emojiRegex = /\p{Emoji}/u;
    if (!emojiRegex.test(decodeURIComponent(emoji1)) || !emojiRegex.test(decodeURIComponent(emoji2))) {
        return api.sendMessage(
            "❌ Please provide valid emojis!",
            threadID,
            messageID
        );
    }

    // Create API URL
    const apiUrl = `https://rubish-apihub.onrender.com/rubish//emojimix?emoji1=${emoji1}&emoji2=${emoji2}&apikey=rubish69`;
    
    try {
        // Create temporary directory if not exists
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Generate unique filename
        const fileName = `emojimix-${Date.now()}.png`;
        const filePath = path.join(tempDir, fileName);

        // Download and save image
        const response = await axios({
            method: 'GET',
            url: apiUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Send image and delete file
        api.sendMessage({
            body: "✨ Here's your emoji mix:",
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            fs.unlinkSync(filePath); // Delete after sending
        }, messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage(
            "❌ Failed to generate emoji mix. Please try again with different emojis.",
            threadID,
            messageID
        );
    }
};
