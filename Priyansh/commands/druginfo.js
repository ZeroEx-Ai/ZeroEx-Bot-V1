const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
  name: "druginfo",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Adi.0X",
  description: "Get medicine details with image",
  commandCategory: "Health",
  usages: "/druginfo [medicine name]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  if (args.length === 0) {
    return api.sendMessage("❌ দয়া করে একটি ওষুধের নাম লিখুন!\nউদাহরণ: /druginfo Napa", event.threadID);
  }

  let medicineName = args.join(" ");
  let searchUrl = `https://medex.com.bd/brands/${medicineName.replace(/\s+/g, "-")}`;

  try {
    let { data } = await axios.get(searchUrl);
    let $ = cheerio.load(data);

    let medName = $(".brand-title").text().trim();
    let genericName = $(".generic a").text().trim();
    let company = $(".company a").text().trim();
    let price = $(".strength span").text().trim();
    let imgUrl = $(".medicine-image img").attr("src") || "https://via.placeholder.com/150";

    if (!medName) {
      return api.sendMessage(`❌ ওষুধ "${medicineName}" খুঁজে পাওয়া যায়নি।`, event.threadID);
    }

    let message = `📌 **ওষুধের তথ্য** 📌\n\n` +
                  `🩺 **নাম:** ${medName}\n` +
                  `💊 **জেনেরিক নাম:** ${genericName}\n` +
                  `🏢 **কোম্পানি:** ${company}\n` +
                  `💰 **মূল্য:** ${price}\n\n` +
                  `🔍 আরও জানতে ভিজিট করুন: ${searchUrl}`;

    let imgData = await axios.get(imgUrl, { responseType: "arraybuffer" });
    let path = __dirname + "/cache/medicine.jpg";
    require("fs").writeFileSync(path, imgData.data);

    return api.sendMessage({ body: message, attachment: require("fs").createReadStream(path) }, event.threadID);
  } catch (error) {
    return api.sendMessage("❌ তথ্য আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন!", event.threadID);
  }
};
