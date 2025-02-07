module.exports.config = {
    name: "say",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Text to voice",
    commandCategory: "media",
    usages: "/say [language] [text] (or reply to a message with /say [language])",
    cooldowns: 5,
    dependencies: {
        "path": "",
        "fs-extra": ""
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

module.exports.run = async function({ api, event, args }) {
    try {
        const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
        const { resolve } = global.nodemodule["path"];

        // চেক করব ইউজার ভাষার নাম দিয়েছে কিনা
        if (args.length < 1) return api.sendMessage("Usage: /say [language] [text] (or reply to a message with /say [language])", event.threadID, event.messageID);

        // ভাষার নাম বের করা
        var langInput = args[0].toLowerCase();
        var lang = languageMap[langInput] || langInput;

        // অনুবাদ করার টেক্সট বের করা
        var textToSay = args.slice(1).join(" ");

        // যদি ইউজার কোনো মেসেজের রিপ্লাই দিয়ে কমান্ড চালায়, তাহলে সেই মেসেজ পাঠাব
        if (event.type === "message_reply" && !textToSay) {
            textToSay = event.messageReply.body;
        }

        // যদি ভয়েসের জন্য কোনো টেক্সট না থাকে, তাহলে এরর দেখাব
        if (!textToSay) return api.sendMessage("Please provide text to convert to voice or reply to a message with /say [language].", event.threadID, event.messageID);

        // ভয়েস ফাইল ডাউনলোডের জন্য পাথ সেট করা
        const path = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);
        
        // Google TTS থেকে ভয়েস ডাউনলোড করা
        await global.utils.downloadFile(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSay)}&tl=${lang}&client=tw-ob`, path);

        // টেক্সট + ভয়েস পাঠানো
        return api.sendMessage({
            body: `Text: ${textToSay}\n${langInput} Voice`,
            attachment: createReadStream(path)
        }, event.threadID, () => unlinkSync(path), event.messageID);

    } catch (e) { 
        return console.log(e);
    }
};
