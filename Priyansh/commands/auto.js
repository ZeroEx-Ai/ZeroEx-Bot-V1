module.exports.config = {
  name: "auto",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Nayan",
  description: "Auto video downloader",
  commandCategory: "Media",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event }) {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  
  try {
    const link = event.body;
    if (!link || !/https?:\/\//.test(link)) return;

    api.setMessageReaction("🔍", event.messageID, () => {}, true);
    
    // Use pure Node.js implementation instead of shell-dependent packages
    const response = await axios.get(link, {
      responseType: 'stream',
      validateStatus: status => status === 200
    });

    const cachePath = __dirname + `/cache/auto_${Date.now()}.mp4`;
    const writer = fs.createWriteStream(cachePath);
    
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    api.setMessageReaction("✔️", event.messageID, () => {}, true);
    
    api.sendMessage({
      body: "📥 Video downloaded successfully!",
      attachment: fs.createReadStream(cachePath)
    }, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);

  } catch (error) {
    console.error("Auto-download error:", error);
    api.sendMessage("❌ Failed to process video link", event.threadID, event.messageID);
  }
};
