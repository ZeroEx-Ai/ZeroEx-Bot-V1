module.exports.config = {
    name: "pairv2",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Adi.0X",
    description: "Pair with people in the group (opposite gender if available)",
    commandCategory: "Fun",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "jimp": ""
    }
}

module.exports.onLoad = async () => {
    const { resolve } = global.nodemodule["path"];
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/canvas/`;
    const path = resolve(__dirname, 'cache/canvas', 'pairing.jpg');
    if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://i.pinimg.com/736x/15/fa/9d/15fa9d71cdd07486bb6f728dae2fb264.jpg", path);
}

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"]; 
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache", "canvas");

    let pairing_img = await jimp.read(__root + "/pairing.jpg");
    let pathImg = __root + `/pairing_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;
    
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));
    
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));
    
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    pairing_img.composite(circleOne.resize(85, 85), 355, 100)
               .composite(circleTwo.resize(75, 75), 250, 140);
    
    let raw = await pairing_img.getBufferAsync("image/png");
    
    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);
    
    return pathImg;
}

async function circle(image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;
    var tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    var tle = tl[Math.floor(Math.random() * tl.length)];

    // Get sender's info
    let senderData = await api.getUserInfo(senderID);
    let senderName = senderData[senderID].name;
    let senderGender = senderData[senderID].gender; // 1: female, 2: male, etc.

    // Get thread info
    let threadInfo = await api.getThreadInfo(threadID);
    let allIDs = threadInfo.participantIDs;

    // Remove sender and bot from candidates
    const botID = api.getCurrentUserID();
    allIDs = allIDs.filter(id => id != senderID && id != botID);

    // Determine target gender based on sender's gender:
    // If sender is female (1), target male (2). If sender is male (2), target female (1).
    let targetGender = (senderGender == 1 ? 2 : senderGender == 2 ? 1 : null);

    // Filter candidates with opposite gender if possible
    let filteredIDs = [];
    if (targetGender !== null) {
        let candidatesInfo = await Promise.all(allIDs.map(id => api.getUserInfo(id).catch(e => null)));
        for (let i = 0; i < allIDs.length; i++) {
            let info = candidatesInfo[i];
            if (info && info[allIDs[i]] && info[allIDs[i]].gender == targetGender) {
                filteredIDs.push(allIDs[i]);
            }
        }
    }
    // If no candidate with the opposite gender is found, fallback to all candidates
    let candidateIDs = filteredIDs.length > 0 ? filteredIDs : allIDs;

    if (candidateIDs.length === 0) {
         return api.sendMessage("No candidate available for pairing.", threadID, messageID);
    }

    // Select a random candidate from the candidateIDs array
    let selectedCandidateID = candidateIDs[Math.floor(Math.random() * candidateIDs.length)];
    let candidateData = await api.getUserInfo(selectedCandidateID);
    let candidateName = candidateData[selectedCandidateID].name;
    
    // Prepare mentions for the message
    var arraytag = [];
    arraytag.push({ id: senderID, tag: senderName });
    arraytag.push({ id: selectedCandidateID, tag: candidateName });
    
    // Use makeImage to generate the pairing image
    var one = senderID, two = selectedCandidateID;
    return makeImage({ one, two }).then(path =>
        api.sendMessage({
            body: `Congratulations ${senderName} was paired with ${candidateName}\nPair odds are: ${tle}`,
            mentions: arraytag,
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID)
    );
}
