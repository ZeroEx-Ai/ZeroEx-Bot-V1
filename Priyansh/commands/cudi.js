module.exports.config = {
    name: "cudi",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "...",
    description: "একাধিক ব্যক্তিকে ট্যাগ করে ক্রমাগত মেসেজ পাঠাবে, /cudi off দিলে বন্ধ হবে।",
    commandCategory: "fun",
    usages: "/cudi @mention1 @mention2 ... | /cudi off",
    cooldowns: 10
};

let activeThreads = {}; // চালু থাকা থ্রেড ট্র্যাক করবে

module.exports.run = async function({ api, event, args }) {
    let threadID = event.threadID;
    let command = args[0];

    // যদি "/cudi off" দেয়া হয়, তাহলে বন্ধ করে দেবে
    if (command === "off") {
        if (activeThreads[threadID]) {
            clearInterval(activeThreads[threadID]); // লুপ বন্ধ
            delete activeThreads[threadID];
            return api.sendMessage("✅ Cudi বন্ধ হয়ে গেছে!", threadID);
        } else {
            return api.sendMessage("Cudi আগে থেকেই বন্ধ আছে!", threadID);
        }
    }

    // মেনশন করা ইউজারদের বের করা
    let mentions = event.mentions;
    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("⚠️ দয়া করে অন্তত একজনকে @mention করুন!", threadID);
    }

    let mentionData = Object.keys(mentions).map(id => ({ id, tag: mentions[id] }));
    
    // যদি আগে থেকেই চালু থাকে, তাহলে বার্তা দেয়
    if (activeThreads[threadID]) {
        return api.sendMessage("⚠️ Cudi ইতিমধ্যে চালু আছে! বন্ধ করতে /cudi off ব্যবহার করুন।", threadID);
    }

    // লুপ চালু করা
    activeThreads[threadID] = setInterval(() => {
        let messages = [
            "চুদা লো {name}!",
            "খাংকির পোলা {name} তর মারে চুদি 🥰।",
            "খাংকির পোলা {name} তর কচি বোন রে চুদি 😍..",
            "মাদারচোদ {name} তর আম্মু পম পম খাংকির পো 🐰",
            "খাংকির পোলা {name} তর কচি ভুদায় ভুদায় কামর দিমু 💔!"
        ];

        mentionData.forEach((mention, index) => {
            setTimeout(() => {
                let msg = messages[Math.floor(Math.random() * messages.length)].replace("{name}", mention.tag);
                api.sendMessage({ body: msg, mentions: [mention] }, threadID);
            }, index * 5000); // প্রতিটি মেসেজের মধ্যে ৫ সেকেন্ড গ্যাপ
        });

    }, 20000); // প্রতি ২০ সেকেন্ডে একবার রিপিট হবে

    return api.sendMessage("✅ Cudi চালু হয়েছে!", threadID);
};
