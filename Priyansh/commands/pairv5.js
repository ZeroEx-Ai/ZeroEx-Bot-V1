module.exports.config = {
    name: "pairv5",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Pair family",
    commandCategory: "Fun",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
}

module.exports.onLoad = async () => {
    const { resolve } = global.nodemodule["path"];
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/canvas/`;
    const path = resolve(__dirname, 'cache/canvas', 'araa.jpg');
    if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://imgur.com/D35mTwa.jpg", path);
}

async function makeImage({ one, two, three }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"]; 
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache", "canvas");

    let pairing_img = await jimp.read(__root + "/araa.jpg");
    let pathImg = __root + `/araa_${one}_${two}_${three}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;
    let avatarThree = __root + `/avt_${three}.png`;

    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));
    
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));
    
    let getAvatarThree = (await axios.get(`https://graph.facebook.com/${three}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarThree, Buffer.from(getAvatarThree, 'utf-8'));  
    
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    let circleThree = await jimp.read(await circle(avatarThree));
    
    pairing_img
        .composite(circleOne.resize(65, 65), 135, 260)
        .composite(circleTwo.resize(65, 65), 230, 210)
        .composite(circleThree.resize(60, 60), 193, 370);
    
    let raw = await pairing_img.getBufferAsync("image/png");
    
    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);
    fs.unlinkSync(avatarThree);
    
    return pathImg;
}

async function circle(image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
}

module.exports.run = async function({ api, event, args, Users, Threads }) {
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;
    
    var tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    var tle = tl[Math.floor(Math.random() * tl.length)];
    
    // Get sender's info
    var info = await api.getUserInfo(senderID);
    var nameSender = info[senderID].name;
    var arraytag = [];
    arraytag.push({ id: senderID, tag: nameSender });
    
    // Get thread info and select two random participants
    let threadInfo = await api.getThreadInfo(threadID);
    var participantIDs = threadInfo.participantIDs;
    
    // Randomly select two IDs from the thread
    var randomID1 = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    var randomID2 = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    
    var name1 = (await Users.getData(randomID1)).name;
    var name2 = (await Users.getData(randomID2)).name;
    
    var one = senderID, two = randomID1, three = randomID2;
    
    return makeImage({ one, two, three }).then(path =>
        api.sendMessage({
            body: `Happy Family 👪 Pair\n${nameSender} x ${name1} x ${name2}\nFamily Pair odds: ${tle}`,
            mentions: arraytag,
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID)
    );
}
