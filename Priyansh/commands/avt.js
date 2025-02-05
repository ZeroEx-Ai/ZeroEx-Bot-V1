module.exports.config = {
  name: "pp",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "Get avatar by user ID or profile link",
  commandCategory: "Công cụ",
  cooldowns: 0
};

module.exports.run = async function ({ api, event, args, Threads }) {
  const request = require("request");
  const fs = require("fs");
  const axios = require("axios");

  const threadSetting = (await Threads.getData(String(event.threadID))).data || {};
  const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;
  const mn = this.config.name;

  if (!args[0]) {
    return api.sendMessage(
      `╭───𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗣𝗶𝗰───◆\n` +
        `⋄Get Group Photo: ${prefix}${mn} box\n` +
        `⋄Get Profile Photo by user ID: ${prefix}${mn} id [user id]\n` +
        `⋄Get Profile Photo by Facebook link: ${prefix}${mn} link [fb link]\n` +
        `⋄Get your own Profile Photo: ${prefix}${mn}\n` +
        `⋄Get Profile Photo of mentioned user: ${prefix}${mn} user [@mention]\n╰──────────◆`,
      event.threadID,
      event.messageID
    );
  }

  const fetchAvatar = async (id) => {
    const filePath = __dirname + "/cache/avatar.png";
    const avatarUrl = `https://graph.facebook.com/${id}/picture?height=720&width=720`;

    request(encodeURI(avatarUrl))
      .pipe(fs.createWriteStream(filePath))
      .on("close", () => {
        api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });
  };

  if (args[0] === "box") {
    let threadInfo = await api.getThreadInfo(event.threadID);
    let img = threadInfo.imageSrc;
    if (!img) return api.sendMessage(`⋄No Photo found for this group.`, event.threadID, event.messageID);

    request(encodeURI(img))
      .pipe(fs.createWriteStream(__dirname + "/cache/avatar.png"))
      .on("close", () => {
        api.sendMessage({ attachment: fs.createReadStream(__dirname + "/cache/avatar.png") }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/avatar.png"), event.messageID);
      });
  } else if (args[0] === "id") {
    let id = args[1];
    if (!id) return api.sendMessage(`⋄Please provide a user ID.`, event.threadID, event.messageID);
    await fetchAvatar(id);
  } else if (args[0] === "link") {
    let link = args[1];
    if (!link) return api.sendMessage(`⋄Please provide a Facebook profile link.`, event.threadID, event.messageID);

    try {
      let res = await axios.get(`https://id.traodoisub.com/api.php?link=${encodeURIComponent(link)}`);
      if (res.data.success) {
        await fetchAvatar(res.data.id);
      } else {
        api.sendMessage(`⋄Could not retrieve UID from the provided link.`, event.threadID, event.messageID);
      }
    } catch (e) {
      api.sendMessage(`⋄Error retrieving UID. Make sure the link is correct.`, event.threadID, event.messageID);
    }
  } else if (args[0] === "user") {
    if (!args[1]) {
      await fetchAvatar(event.senderID);
    } else if (Object.keys(event.mentions).length > 0) {
      let mentions = Object.keys(event.mentions);
      await fetchAvatar(mentions[0]);
    } else {
      api.sendMessage(`⋄Invalid command usage. Use ${prefix}${mn} to see available options.`, event.threadID, event.messageID);
    }
  } else {
    api.sendMessage(`⋄Invalid command usage. Use ${prefix}${mn} to see available options.`, event.threadID, event.messageID);
  }
};
