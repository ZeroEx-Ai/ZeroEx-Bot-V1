module.exports.config = {
  name: "auto",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Nayan",
  description: "Auto video downloader",
  commandCategory: "Media",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "nayan-videos-downloader": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const { alldown } = global.nodemodule["nayan-videos-downloader"];
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  
  try {
    const link = event.body;
    
    if (!link || !link.startsWith("http")) return;
    
    // Add searching reaction
    api.setMessageReaction("🔍", event.messageID, (err) => {}, true);
    
    // Fetch video data
    const data = await alldown(link);
    const { high, title } = data.data;
    
    // Add success reaction
    api.setMessageReaction("✔️", event.messageID, (err) => {}, true);
    
    // Download video
    const videoData = (await axios.get(high, { 
      responseType: "arraybuffer" 
    })).data;
    
    // Create cache path
    const cachePath = __dirname + `/cache/auto_${Date.now()}.mp4`;
    
    // Save to cache
    fs.writeFileSync(cachePath, Buffer.from(videoData, "utf-8"));
    
    // Send video
    api.sendMessage({
      body: `📥 Downloaded Successfully!\n📛 Title: ${title}`,
      attachment: fs.createReadStream(cachePath)
    }, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);
    
  } catch (error) {
    console.error("Auto-download error:", error);
    api.sendMessage("❌ Failed to download video. Please check the link and try again.", event.threadID, event.messageID);
  }
};
