module.exports.config = {
  name: "bdnews",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "YourName",
  description: "বাংলাদেশ সংবাদ দেখায় (কাস্টম query এবং category সহ)",
  commandCategory: "News",
  usages: "/bdnews [query] [category] (উদাহরণ: /bdnews খেলাধুলা top)",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async function ({ event, api, args }) {
  const axios = global.nodemodule["axios"];
  const { threadID, messageID } = event;

  if (args.length < 2) {
    return api.sendMessage("দয়া করে query এবং category দিন।\nউদাহরণ: /bdnews খেলাধুলা top", threadID, messageID);
  }

  // query এবং category ইনপুট হিসাবে গ্রহণ করা
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

    // API response থেকে "results" অ্যারে ব্যবহার করা
    const articles = response.data.results;
    if (!articles || articles.length === 0) {
      return api.sendMessage(`"${query}" ক্যাটেগরির কোনো সংবাদ পাওয়া যায়নি।`, threadID, messageID);
    }

    // সংবাদগুলোর শিরোনামের তালিকা তৈরি করা
    let listMessage = `📰 "${query}" ক্যাটেগরির সংবাদ তালিকা:\n\n`;
    articles.forEach((article, index) => {
      listMessage += `${index + 1}. ${article.title}\n`;
    });
    listMessage += "\nবিস্তারিত জানার জন্য উপরের তালিকা থেকে সংখ্যাটি রিপ্লাই করুন।";

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
  const selectedNumber = parseInt(body.trim());

  if (isNaN(selectedNumber)) {
    return api.sendMessage("শুধুমাত্র তালিকার সংখ্যাটি লিখুন।", threadID, messageID);
  }

  const index = selectedNumber - 1;
  const articles = handleReply.articles;
  if (index < 0 || index >= articles.length) {
    return api.sendMessage("সঠিক সংখ্যা প্রদান করুন।", threadID, messageID);
  }

  const article = articles[index];

  // সংবাদ বিস্তারিত তথ্য
  let detailMessage = `📰 শিরোনাম: ${article.title}\n`;
  detailMessage += `📝 বিবরণ: ${article.description || "উপলব্ধ নয়"}\n`;
  detailMessage += `🔗 উৎস: ${article.source_name || "উপলব্ধ নয়"}\n`;
  detailMessage += `📅 তারিখ: ${article.pubDate || "উপলব্ধ নয়"}\n`;
  detailMessage += `🔗 লিংক: ${article.link || "উপলব্ধ নয়"}`;

  // যদি ছবি থাকে, তাহলে attachment হিসেবে পাঠানো হবে
  if (article.image_url) {
    try {
      const stream = await global.utils.getStreamFromURL(article.image_url);
      return api.sendMessage({
        body: detailMessage,
        attachment: stream
      }, threadID, messageID);
    } catch (err) {
      // ছবি ডাউনলোডে সমস্যা হলে শুধু টেক্সট পাঠানো হবে
      return api.sendMessage(detailMessage, threadID, messageID);
    }
  } else {
    return api.sendMessage(detailMessage, threadID, messageID);
  }
};
