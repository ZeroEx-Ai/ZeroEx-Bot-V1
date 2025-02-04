module.exports.config = {
  name: "auto",
  version: "0.0.2",
  hasPermssion: 0,
  credits: "Nayan",
  description: "Auto video download",
  commandCategory: "user",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "nayan-videos-downloader": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  const { alldown } = global.nodemodule["nayan-videos-downloader"];
  
  try {
    const link = event.body;
    
    if (!link.startsWith("http")) return;
    
    api.setMessageReaction("🔍", event.messageID, (err) => {}, true);
    const data = await alldown(link);
    const { high, title } = data.data;
    api.setMessageReaction("✔️", event.messageID, (err) => {}, true);

    const video = (await axios.get(high, { responseType: "arraybuffer" })).data;
    const cachePath = __dirname + `/cache/auto_${Date.now()}.mp4`;
    
    fs.writeFileSync(cachePath, Buffer.from(video, "utf-8"));
    
    return api.sendMessage({
      body: `《TITLE》: ${title}`,
      attachment: fs.createReadStream(cachePath)
    }, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);
    
  } catch (error) {
    console.error("Auto-download error:", error);
    return api.sendMessage("❌ Failed to download the video.", event.threadID, event.messageID);
  }
};
