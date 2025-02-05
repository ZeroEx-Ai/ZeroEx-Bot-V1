const fs = require('fs');
const axios = require('axios');

module.exports.config = {
    name: "dp",
    version: "1.0.0",
    hasPermission: 1,
    credits: "Bot Developer",
    description: "Send profile picture of a user",
    commandCategory: "utilities",
    usages: "/dp [uid | @mention | fb link]",
    cooldowns: 5
}

module.exports.run = async function({ api, event, args }) {
    let mentionedUserID = event.messageReply ? event.messageReply.senderID : (event.mentions ? Object.keys(event.mentions)[0] : args[0]);
    
    if (!mentionedUserID) {
        return api.sendMessage("Please mention a user or provide a valid Facebook ID!", event.threadID);
    }

    const profilePicUrl = `https://graph.facebook.com/${mentionedUserID}/picture?width=720&height=720&access_token=YOUR_ACCESS_TOKEN`;

    try {
        // Download the profile picture
        const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
        
        // Save the file temporarily
        const filePath = `./tmp/${mentionedUserID}_profile_pic.jpg`;
        fs.writeFileSync(filePath, response.data);

        // Send the image as an attachment
        api.sendMessage({
            body: `Here is the profile picture of the mentioned user:`,
            attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
            // Delete the temporary file after sending
            fs.unlinkSync(filePath); // This will delete the cached file after sending
        });

    } catch (error) {
        console.error("Error fetching the profile picture: ", error);
        api.sendMessage("Could not retrieve the profile picture. Please try again later.", event.threadID);
    }
}
