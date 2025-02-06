const fs = require("fs");
const path = __dirname + "/cache/autoreact_settings.json";

// যদি ফোল্ডার না থাকে, তাহলে স্বয়ংক্রিয়ভাবে তৈরি করবে
if (!fs.existsSync(__dirname + "/cache")) {
  fs.mkdirSync(__dirname + "/cache", { recursive: true });
}

// যদি JSON ফাইল না থাকে, তাহলে সেটাও তৈরি করবে
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// ফাইল থেকে সেটিংস লোড করবে
let settings = JSON.parse(fs.readFileSync(path, "utf8"));

module.exports.config = {
  name: "autoreact",
  version: "1.2.2",
  hasPermission: 0,
  credits: "Adi.0X",
  description: "Bot React with on/off system",
  commandCategory: "No Prefix",
  usages: "[on/off]",
  cooldowns: 0,
};

module.exports.handleEvent = function ({ api, event }) {
  const { threadID, messageID, body } = event;

  // চেক করো যে অটো-রিয়্যাক্ট চালু আছে কিনা
  if (!settings[threadID] || !settings[threadID].enabled) return;

  let react = body.toLowerCase();
  let reaction = null;

  if (react.includes("soul")) {
    reaction = "🖤";
  } else if (
    react.includes("love") || react.includes("lab") || react.includes("kiss")
  ) {
    reaction = "❤️";
  } else if (
    react.includes("sad") || react.includes("depress") || react.includes("😭")
  ) {
    reaction = "😢";
  } else if (react.includes("india") || react.includes("bharat")) {
    reaction = "🇮🇳";
  } else if (react.includes("wow") || react.includes("robot")) {
    reaction = "😮";
  }

  if (reaction) {
    api.setMessageReaction(reaction, messageID, (err) => {}, true);
  }
};

module.exports.run = function ({ api, event, args }) {
  const { threadID } = event;

  if (args.length === 0) {
    return api.sendMessage("ব্যবহার: /autoreact [on/off]", threadID);
  }

  if (args[0] === "on") {
    settings[threadID] = { enabled: true };
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    return api.sendMessage("✅ AutoReact চালু করা হলো!", threadID);
  } else if (args[0] === "off") {
    settings[threadID] = { enabled: false };
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    return api.sendMessage("❌ AutoReact বন্ধ করা হলো!", threadID);
  } else {
    return api.sendMessage("❌ ভুল কমান্ড! ব্যবহার করুন: /autoreact [on/off]", threadID);
  }
};
