module.exports.config = {
    name: "trans",
    version: "1.0.4",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Text translation",
    commandCategory: "media",
    usages: "/trans [language] [text] (or reply to a message with /trans [language])",
    cooldowns: 5,
    dependencies: {
        "request": ""
    }
};

// ভাষার নাম থেকে ISO কোডে রূপান্তরের জন্য ম্যাপিং
const languageMap = {
    "bangla": "bn",
    "english": "en",
    "hindi": "hi",
    "urdu": "ur",
    "spanish": "es",
    "french": "fr",
    "german": "de",
    "chinese": "zh",
    "japanese": "ja",
    "korean": "ko",
    "russian": "ru",
    "arabic": "ar",
    "italian": "it",
    "portuguese": "pt",
    "turkish": "tr",
    "dutch": "nl",
    "greek": "el"
};

module.exports.run = async ({ api, event, args }) => {
    const request = global.nodemodule["request"];

    // চেক করব ইউজার ভাষা লিখেছে কিনা
    if (args.length < 1) return api.sendMessage("Usage: /trans [language] [text] (or reply to a message with /trans [language])", event.threadID, event.messageID);

    // ভাষার নাম বের করা
    var langInput = args[0].toLowerCase();
    var lang = languageMap[langInput] || langInput;

    // অনুবাদ করার টেক্সট বের করা
    var translateThis = args.slice(1).join(" ");
    
    // যদি ইউজার কোনো মেসেজের রিপ্লাই দিয়ে কমান্ড চালায়, তাহলে সেই মেসেজ অনুবাদ করব
    if (event.type === "message_reply" && !translateThis) {
        translateThis = event.messageReply.body;
    }

    // যদি অনুবাদের জন্য কোনো টেক্সট না থাকে, তাহলে এরর দেখাব
    if (!translateThis) return api.sendMessage("Please provide text to translate or reply to a message with /trans [language].", event.threadID, event.messageID);

    // Google Translate API-তে অনুরোধ পাঠানো
    return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`), 
    (err, response, body) => {
        if (err) return api.sendMessage("An error has occurred!", event.threadID, event.messageID);
        var retrieve = JSON.parse(body);
        var text = retrieve[0].map(item => item[0]).join("");
        var detectedLang = retrieve[2];

        api.sendMessage(`────────────────⟡\n│Detect Language: ${detectedLang}\n│Translation to ${langInput}\n────────────────⟡\n${text}`, event.threadID, event.messageID);
    });
};
