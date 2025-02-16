module.exports.config = {
    name: "cudi",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "Adi.0X",
    description: "একাধিক ব্যক্তিকে ট্যাগ করে ক্রমাগত চোদানো, /cudi off দিলে বন্ধ হবে।",
    commandCategory: "Attack",
    usages: "/cudi @mention1 @mention2 ... | /cudi off",
    cooldowns: 1
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
        return api.sendMessage("বস্ দয়া করে অন্তত একজন মুরগিকে @mention করুন!😋", threadID);
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
            "মাদারচোদ {name} তর আম্মুর পম পম চুষে দি, যা নিয়ে আয় খাংকির পোলা 🐰",
            "কিরে আমার জারজ পোলা {name}",
            "{name} তোর আম্মুর সাথে খাট কাঁপানোর ফসল তুই 🤮",
            "খাংকির পোলা {name} তর বোনের কচি ভুদায় ভুদায় কামর দিমু 💔!",
            "এ {name} খাংকি মাগির পোলা কথা ক কম কম\n তর আম্মু রে চুদে বানামু আইটেম বোম",
            "depression থেকেও {name} মাইরে চুদি 🤬 ",
            "{name} তর আম্মু রে আচার এর লোভ দেখি চুদি মাগির পোলা🤬",
            "বান্দির পোলা {name} তর কচি বোনের ভুদা ফাক কর থুতু দিয়ে ভুদায় দন ডুকামু 🍌💦",
            "{name} বান্দি মাগির পোলা তর আম্মু রে চুদি তর দুলা ভাই এর কান্দে ফেলে 🤝",
            "উফফফ খাদ্দামা মাগির পোলা তর আম্মুর কালা ভুদায় আমার মাল আউট তর কচি বোন রে উপ্তা করে এবার চুদবো 💉😋 {name}",
            "{name} অনলাইনে গালিবাজ হয়ে গেছত মাগির পোলা এমন চুদা দিমু লাইফ টাইম মনে রাখবি আমি তর বাপ, মাগির ছেলে 😘।",
            "বাতিজা শুন তর আম্মু রে চুদলে রাগ করবি না তো আচ্ছা যা রাগ করিস না তর আম্মুর কালা গন্ধ ভোদা আর চুদলাম না তো বোন এর জামা টা খুলে দে ✋🥰 {name}",
            "{name} হাই মাদারচোদ তর ব্যাশা জাতের আম্মু টা রে আদর করে করে চুদি 🌶️💦",
            "{name} ~ চুদা কি আরো খাবি মাগির পোলা 🤖",
            "কালা ভোদার থেকে বের হওয়া আমার ছেলে {name} কইরে 😵‍💫",
            "{name} খানকির পোলা কোইরে সিন দে",
            "{name} মাদারচোদ 🤣🤣",
            "পতিতা মাগিরপোলা {name}😂",
            "ব্যাশ্যা মাগির পোলা 🤢 {name}",
            "{name} তর মারে চুদি",
            "{name} তর বোন রে পায়জামা খুলে চুদি 🤣",
            "😘 উম্মম্মা {name} এর বোনের কচি ভুদায়💉।",
            "{name} DNA টেষ্ট করে দেখবি আমার চুদা তেই তর জন্ম। 🧬",
            "কামলা মাগির পোলা ✋ {name}",
            "বাস্ট্রাড এর বাচ্চা বস্তির পোলা {name}",
            "{name}~ আমার জারজ সন্তান 🤖",
            "{name} তর কচি বোন এর পম পম😍..",
            "{name} ব্যাস্যার পোলা কথা শুন তর আম্মু রে চুদি গামছা পেচিয়ে🐰", 
            "Hi আদির জারজ মাগির পোলা {name}!",
            "২০ টাকা পতিতা মাগির পোলা {name} 😵",
            "বস্তির ছেলে অনলাইনের কিং {name} 😂",
            "টুকাই মাগির পোলা🤟 {name}",
            "{name}, আম্মু রে পায়জামা খুলে চুদি 🤣",
            "হিজলা মাগির পোলা {name}✋",
            "বস্তিরন্দালাল এর বাচ্চা বস্তির পোলা {name}",
            "{name}~ আমার জারজ সন্তান যা ভাগ🤖",
            "Welcome শুয়োরের বাচ্চা {name}🥰।",
            "কুত্তার বাচ্চা {name} এর কচি বোনের দুধের বোটা😍..",
            "বস্তির ছেলে {name} তোর বইনরে মুসলমানি দিমু 🔪",
            "টুকাই মাগির পোলা {name} মোবাইল ভাইব্রেশন কইরা তুর কচি বোন এর পুকটিতে ভরবো।🤟📳",
            "{name} তোর মুখে হাইগ্যা দিমু। 🤣💩",
            "তোরে কুত্তার পুকটি চাটামু💉 {name}।",
            "{name} তর আম্মুর হোগা দিয়া ট্রেন ভইরা দিমু 🚄",
            "{name} হিজলা মাগির পোলা হাতির ল্যাওড়া দিয়া তর মায়েরে চুদবো। ✋",
            "{name} তর বোন ভোদা ছিল্লা লবণ লাগায় দিমু। 🌶️😝",
            "{name} ~ আমার ফাটা কন্ডমের ফসল। যাঃ ভাগ🤖",
            "কুত্তার বাচ্চা {name} তর বোনের ভোদায় মাগুর মাছ চাষ করুম।😍..",
            "{name} খাঙ্কিরপোলা পোলা তর বোনের হোগায় ইনপুট, তর মায়ের ভোদায় আউটপুট।🐰",
            "{name} তর মায়ের ভোদা বোম্বাই মরিচ দিয়া চুদামু।🌶️🖕!",
            "{name} খান্কি মাগির পোলা তর মায়ের ভোদা শিরিষ কাগজ দিয়া ঘইষা দিমু। ",
            "জং ধরা লোহা দিয়া পাকিস্তানের মানচিত্র বানাই্য়া তোদের পিছন দিয়া ঢুকামু।🤬 ",
            "বস্তির ছেলে {name} তর মায়ের ভুদাতে পোকা 🪱🦠🐞🪰",
            "টুকাই মাগির পোলা {name} তর মার ভোদায় পাব্লিক টয়লেট 🚽",
            "{name} তোর মুখে হাইগ্যা দিমু। ভুস্কি মাগির পোলা 🤣",
            "{name} তোর কান্দে ফালাইয়া তর মায়েরে চুদি💉",
            "{name} তর আম্মুর উপ্তা কইরা চুদা দিমু।।",
            "হিজলা মাগির পোলা বালি দিয়া চুদমু তর খাঙ্কি মাগী মাকে। ✋{name}",
            "{name} ~ আমার পুত। যাহ ভাগ🤖"
            

        ];

        mentionData.forEach((mention, index) => {
            setTimeout(() => {
                let msg = messages[Math.floor(Math.random() * messages.length)].replace("{name}", mention.tag);
                api.sendMessage({ body: msg, mentions: [mention] }, threadID);
            }, index * 1000); // প্রতিটি মেসেজের মধ্যে 1 সেকেন্ড গ্যাপ
        });

    }, 1000); // প্রতি 61 সেকেন্ডে একবার রিপিট হবে

    return api.sendMessage("✅ Cudi চালু হয়েছে!", threadID);
};
