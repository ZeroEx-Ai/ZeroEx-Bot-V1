const fs = require("fs");
const path = require("path");
const request = require("request");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "lgbtq",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Adi.0X",
  description: "Overlay user profile picture with a PNG image",
  commandCategory: "Fun",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
  // নির্ধারণ করা হচ্ছে কোন ইউজারের প্রোফাইল পিকচার ব্যবহার করা হবে:
  // যদি message‑এ @mention থাকে, তাহলে প্রথম mention করা ইউজারের আইডি,
  // অন্যথায়, যদি কোনো আর্গুমেন্ট দেয়া হয় তাহলে তা আইডি হিসেবে গ্রহণ করা হবে,
  // না হলে নিজের প্রোফাইল (event.senderID)।
  let targetID;
  if (event.mentions && Object.keys(event.mentions).length > 0) {
    targetID = Object.keys(event.mentions)[0];
  } else if (args[0]) {
    targetID = args[0];
  } else {
    targetID = event.senderID;
  }

  // Graph API থেকে profile picture-এর URL
  const access_token = "6628568379|c1e620fa708a1d5696fb991c1bde5662"; // উদাহরণস্বরূপ token
  const avatarURL = `https://graph.facebook.com/${targetID}/picture?height=512&width=512&access_token=${access_token}`;

  // overlay হিসেবে ব্যবহার করা PNG-এর URL
  const overlayURL = "https://i.postimg.cc/Y9rLwQ7Y/gay.png";

  try {
    // প্রোফাইল ছবি এবং overlay image load করা
    const avatar = await loadImage(avatarURL);
    const overlay = await loadImage(overlayURL);

    // 512x512 সাইজের canvas তৈরি করা
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    // প্রথমে প্রোফাইল ছবি আঁকা
    ctx.drawImage(avatar, 0, 0, 512, 512);
    // তারপর overlay ছবিটি আঁকা
    ctx.drawImage(overlay, 0, 0, 512, 512);

    // cache ফোল্ডারের জন্য path এবং existence চেক
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // output file path, filename এ timestamp ব্যবহার করা হয়েছে
    const outputPath = path.join(cacheDir, `overlay_${Date.now()}.png`);

    // canvas থেকে PNG file তৈরি করা
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => {
      // file attachment হিসেবে পাঠানো
      api.sendMessage({ attachment: fs.createReadStream(outputPath) }, event.threadID, () => {
        // সফলভাবে পাঠানোর পরে cache থেকে ফাইলটি মুছে ফেলা হবে
        fs.unlink(outputPath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }, event.messageID);
    });
  } catch (err) {
    console.error("Error processing image:", err);
    return api.sendMessage("কিছু একটা ভুল হয়ে গেছে!", event.threadID, event.messageID);
  }
};
