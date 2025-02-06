let isCudiActive = true; // ডিফল্টভাবে চালু থাকবে

module.exports.config = {
    name: "cudi",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Adi.0X",
    description: "মুরগি ট্যাগ করুন\nসেই ব্যক্তিকে আত্মা কলিং বলা যেতে পারে",
    commandCategory: "nsfw",
    usages: " please @mention",
    cooldowns: 10,
    dependencies: {
        "fs-extra": "",
        "axios": ""
    }
}

module.exports.run = async function({ api, event, args }) {
    if (args[0] === "off") {  
        isCudiActive = false;  
        return api.sendMessage("✅ Cudi বন্ধ করা হয়েছে!", event.threadID);
    }

    if (args[0] === "on") {  
        isCudiActive = true;  
        return api.sendMessage("✅ Cudi চালু করা হয়েছে!", event.threadID);
    }

    if (!isCudiActive) return api.sendMessage("❌ Cudi বর্তমানে বন্ধ রয়েছে! অন করতে `/cudi on` লিখুন।", event.threadID);
    
    var mention = Object.keys(event.mentions)[0];
    if (!mention) 
        return api.sendMessage("বস,আপনি কাকে চুদতে চান, দয়া করে @mention করুন!", event.threadID);

    let name = event.mentions[mention];
    var arraytag = [{ id: mention, tag: name }];

    var a = function (message) { 
        if (!isCudiActive) return; // যদি বন্ধ থাকে, তাহলে কিছুই না পাঠায়
        api.sendMessage({ body: message + " " + name, mentions: arraytag }, event.threadID); 
    }

    setTimeout(() => { a("চুদা লো"); }, 0);
    setTimeout(() => { a("খাংকির পোলা তর মারে চুদি 🥰"); }, 3000);
    setTimeout(() => { a("খাংকির পোলা তর কচি বোন রে চুদি 😍"); }, 5000);
    setTimeout(() => { a("মাদারচোদ তর আম্মু পম পম খাংকির পো 🐰"); }, 7000);
    setTimeout(() => { a("খাংকির পোলা তর কচি ভুদায় ভুদায় কামর দিমু 💔"); }, 9000);
}
