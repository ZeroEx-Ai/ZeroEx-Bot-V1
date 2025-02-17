module.exports.config = {
  name: "bdnews",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Adi.0X",
  description: "বাংলাদেশ সংবাদ দেখায় (কাস্টম query এবং category সহ)",
  commandCategory: "News",
  usages: "/bdnews [query] [category] (যেমন: /bdnews খেলা top)",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async function ({ event, api, args, globalGoat }) {
  const axios = global.nodemodule["axios"];
  const { threadID, messageID } = event;

  if (args.length < 2) {
    return api.sendMessage("দয়া করে একটি query এবং category দিন।\n\nউদাহরণ: /bdnews খেলা top", threadID, messageID);
  }

  const query = args[0];
  const category = args[1];

  try {
    const response = await axios.get("https://rubish-apihub.onrender.com/rubish//bdnews", {
      params: {
        query: query,
        category: category,
        apikey: "rubish69"
      }
    });

    const articles = response.data.articles;
    if (!articles || articles.length === 0) {
      return api.sendMessage(`"${query}" ক্যাটেগরির কোনো সংবাদ পাওয়া যায়নি।`, threadID, messageID);
    }

    let listMessage = `📰 "${query}" ক্যাটেগরির সংবাদ তালিকা:\n\n`;
    articles.forEach((article, index) => {
      listMessage += `${index + 1}. ${article.title}\n`;
    });
    listMessage += "\nসংখ্যায় রিপ্লাই করে বিস্তারিত দেখুন।";

    return api.sendMessage(listMessage, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        articles: articles
      });
    }, messageID);
  } catch (error) {
    console.error("BDNews API Error: ", error);
    return api.sendMessage("সংবাদ লোড করার সময় ত্রুটি ঘটেছে।", threadID, messageID);
  }
};

module.exports.handleReply = async function({ event, api, handleReply }) {
  const { threadID, messageID, body } = event;
  const selectedNumber = parseInt(body);

  if (isNaN(selectedNumber)) {
    return api.sendMessage("শুধুমাত্র তালিকার সংখ্যাটি লিখুন।", threadID, messageID);
  }

  const index = selectedNumber - 1;
  const articles = handleReply.articles;
  if (index < 0 || index >= articles.length) {
    return api.sendMessage("সঠিক সংখ্যা প্রদান করুন।", threadID, messageID);
  }

  const selectedArticle = articles[index];
  let detailMessage = `📰 শিরোনাম: ${selectedArticle.title}\n`;
  detailMessage += `📝 বিবরণ: ${selectedArticle.description || "উপলব্ধ নয়"}\n`;
  detailMessage += `🔗 উৎস: ${selectedArticle.source || "উপলব্ধ নয়"}\n`;
  detailMessage += `📅 তারিখ: ${selectedArticle.date || "উপলব্ধ নয়"}`;

  if (selectedArticle.image) {
    return api.sendMessage({
      body: detailMessage,
      attachment: await global.utils.getStreamFromURL(selectedArticle.image)
    }, threadID, messageID);
  } else {
    return api.sendMessage(detailMessage, threadID, messageID);
  }
};
