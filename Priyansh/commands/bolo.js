module.exports.config = {
    name: "bolo",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Aditta Datta",
    description: "Make the bot return Google's audio file in Bengali with text",
    commandCategory: "media",
    usages: "[Text]",
    cooldowns: 5,
    dependencies: {
        "path": "",
        "fs-extra": ""
    }
};

module.exports.run = async function({ api, event, args }) {
    try {
        const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
        const { resolve } = global.nodemodule["path"];
        
        // মেসেজের কনটেন্ট বের করা
        var content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
        
        if (!content) return api.sendMessage("⚠ দয়া করে কিছু লিখুন!", event.threadID, event.messageID);

        // বাংলা ভাষা সেট করা
        var languageToSay = "bn";
        var msg = content;
        
        // অডিও ফাইলের পাথ সেট করা
        const path = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);

        // Google Translate TTS থেকে ডাউনলোড করা
        await global.utils.downloadFile(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`, path);

        // অডিও পাঠানো + টেক্সট সহ
        return api.sendMessage({
            body: `╭───𝗩𝗢𝗜𝗖𝗘───◆\n⋄Text: "${msg}\n⋄Voice"`, 
            attachment: createReadStream(path)
        }, event.threadID, () => unlinkSync(path), event.messageID);

    } catch (e) {
        console.log(e);
        return api.sendMessage("❌ একটি সমস্যা হয়েছে!", event.threadID, event.messageID);
    }
};
