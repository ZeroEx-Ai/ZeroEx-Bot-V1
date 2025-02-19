module.exports.config = {
  name: "pp",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Adi.0X",
  description: "Get profile picture using various options",
  commandCategory: "Tools",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args, Threads }) {
  const request = require("request");
  const fs = require("fs");
  const threadSetting = (await Threads.getData(String(event.threadID))).data || {};
  const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;
  const mn = this.config.name;

  // যদি কোন আর্গুমেন্ট না থাকে, তাহলে মডিউলের ব্যবহারিক পদ্ধতি দেখাবে
  if (!args[0]) {
    return api.sendMessage(
      `╭───𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗣𝗶𝗰───◆\n` +
      `⋄ Get Group Photo: \n    ${prefix}${mn} box\n` +
      `⋄ Get Profile Photo by User ID: \n    ${prefix}${mn} uid [user id]\n` +
      `⋄ Get Profile Photo by Facebook link: \n    ${prefix}${mn} link [fb link]\n` +
      `⋄ Get your own Profile Photo: \n    ${prefix}${mn} user\n` +
      `⋄ Get Profile Photo of mentioned user: \n    ${prefix}${mn} user [@mention]\n╰──────────◆`,
      event.threadID,
      event.messageID
    );
  }

  // pp box - Group Photo
  if (args[0].toLowerCase() === "box") {
    if (args[1]) {
      let threadInfo = await api.getThreadInfo(args[1]);
      let imgg = threadInfo.imageSrc;
      if (!imgg) {
        return api.sendMessage(` ⋄${threadInfo.threadName} Group Photo`, event.threadID, event.messageID);
      } else {
        var callback = () =>
          api.sendMessage(
            { body: ` ⋄${threadInfo.threadName} Group Photo`, attachment: fs.createReadStream(__dirname + "/cache/1.png") },
            event.threadID,
            () => fs.unlinkSync(__dirname + "/cache/1.png"),
            event.messageID
          );
        return request(encodeURI(`${threadInfo.imageSrc}`))
          .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
          .on("close", () => callback());
      }
    }

    let threadInfo = await api.getThreadInfo(event.threadID);
    let img = threadInfo.imageSrc;
    if (!img) {
      return api.sendMessage(` ⋄${threadInfo.threadName} Group Photo`, event.threadID, event.messageID);
    } else {
      var callback = () =>
        api.sendMessage(
          { body: ` ⋄${threadInfo.threadName} Group Photo`, attachment: fs.createReadStream(__dirname + "/cache/1.png") },
          event.threadID,
          () => fs.unlinkSync(__dirname + "/cache/1.png"),
          event.messageID
        );
      return request(encodeURI(`${threadInfo.imageSrc}`))
        .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
        .on("close", () => callback());
    }
  }
  // pp id বা pp uid - Profile Photo by User ID
  else if (args[0].toLowerCase() === "id" || args[0].toLowerCase() === "uid") {
    try {
      var id = args[1];
      if (!id)
        return api.sendMessage(`⋄Please enter a UID to get Profile Photo.`, event.threadID, event.messageID);
      var callback = () =>
        api.sendMessage(
          { attachment: fs.createReadStream(__dirname + "/cache/1.png") },
          event.threadID,
          () => fs.unlinkSync(__dirname + "/cache/1.png"),
          event.messageID
        );
      return request(
        encodeURI(
          `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        )
      )
        .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
        .on("close", () => callback());
    } catch (e) {
      return api.sendMessage(`⋄Can't get user photo`, event.threadID, event.messageID);
    }
  }
  // pp link - Profile Photo by Facebook Link
  else if (args[0].toLowerCase() === "link") {
    var link = args[1];
    if (!link)
      return api.sendMessage(`⋄Please enter a Facebook link to get Profile Photo.`, event.threadID, event.messageID);
    const tool = require("fb-tools");
    try {
      var id = await tool.findUid(link || event.messageReply?.body);
      var callback = () =>
        api.sendMessage(
          { attachment: fs.createReadStream(__dirname + "/cache/1.png") },
          event.threadID,
          () => fs.unlinkSync(__dirname + "/cache/1.png"),
          event.messageID
        );
      return request(
        encodeURI(
          `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        )
      )
        .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
        .on("close", () => callback());
    } catch (e) {
      return api.sendMessage("⋄User does not exist.", event.threadID, event.messageID);
    }
  }
  // pp user - Own Profile Photo or by @mention
  else if (args[0].toLowerCase() === "user") {
    // যদি @mention না থাকে, তাহলে নিজের প্রোফাইল
    if (!args[1]) {
      var id = event.senderID;
      var callback = () =>
        api.sendMessage(
          { attachment: fs.createReadStream(__dirname + "/cache/1.png") },
          event.threadID,
          () => fs.unlinkSync(__dirname + "/cache/1.png"),
          event.messageID
        );
      return request(
        encodeURI(
          `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        )
      )
        .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
        .on("close", () => callback());
    }
    // যদি @mention থাকে, তাহলে প্রথম mention করা ব্যক্তির প্রোফাইল পিকচার দেখাবে
    else if (args[1].includes('@')) {
      let mentionIDs = Object.keys(event.mentions);
      if (mentionIDs.length === 0)
        return api.sendMessage(`⋄No user mentioned.`, event.threadID, event.messageID);
      let id = mentionIDs[0];
      var callback = () =>
        api.sendMessage(
          { attachment: fs.createReadStream(__dirname + "/cache/1.png") },
          event.threadID,
          () => fs.unlinkSync(__dirname + "/cache/1.png"),
          event.messageID
        );
      return request(
        encodeURI(
          `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        )
      )
        .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
        .on("close", () => callback());
    } else {
      return api.sendMessage(`⋄Usage: ${prefix}${mn} user [@mention]`, event.threadID, event.messageID);
    }
  } else {
    return api.sendMessage(`⋄Enter ${prefix}${mn} to see your module's commands..`, event.threadID, event.messageID);
  }
};
