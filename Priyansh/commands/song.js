const fs = require('fs');
const { resolve } = require('path');
const axios = require("axios");
const nayanDownloader = require("nayan-videos-downloader"); // আপডেটেড প্যাকেজ নাম
// যদি প্রয়োজন হয়, এখানে youtube-search-api বা simple-youtube-api ব্যবহার করতে পারেন
const Youtube = require('youtube-search-api');

async function downloadMusicFromYoutube(link, filePath) {
  if (!link) return Promise.reject('Link Not Found');

  const timestart = Date.now();

  try {
    const data = await nayanDownloader.ytdown(link);
    console.log(data);
    const audioUrl = data.data.video;

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: audioUrl,
        responseType: 'stream'
      }).then(response => {
        const writeStream = fs.createWriteStream(filePath);

        response.data.pipe(writeStream)
          .on('finish', async () => {
            try {
              const info = await nayanDownloader.ytdown(link);
              const result = {
                title: info.data.title,
                timestart: timestart
              };
              resolve(result);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (error) => {
            reject(error);
          });
      }).catch(error => {
        reject(error);
      });
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = {
  config: {
    name: "song",
    version: "1.0.0",
    permission: 0,
    credits: "Nayan",
    description: "Example command to download song from YouTube",
    prefix: true,
    category: "Media",
    usages: "song [YouTube URL|search keyword]",
    cooldowns: 5,
    dependencies: {
      "axios": "",
      "fs": "",
      "nayan-videos-downloader": "",
      "simple-youtube-api": ""
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { createReadStream, unlinkSync, statSync } = require("fs-extra");
    try {
      const filePath = `${__dirname}/cache/1.mp3`;
      const selectedIndex = parseInt(event.body) - 1;
      const selectedLink = "https://www.youtube.com/watch?v=" + handleReply.link[selectedIndex];
      const data = await downloadMusicFromYoutube(selectedLink, filePath);

      if (fs.statSync(filePath).size > 26214400) {
        return api.sendMessage(
          'The file cannot be sent because the capacity is greater than 25MB.',
          event.threadID,
          () => unlinkSync(filePath),
          event.messageID
        );
      }
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage({ 
        body: `🎵 Title: ${data.title}\n⏱ Processing time: ${Math.floor((Date.now() - data.timestart)/1000)} second(s)\n🛡 ====DISME PROJECT====🛡`,
        attachment: createReadStream(filePath)
      }, event.threadID, () => unlinkSync(filePath), event.messageID);
    }
    catch (e) {
      console.log(e);
    }
  },
  
  convertHMS: function(value) {
    const sec = parseInt(value, 10); 
    let hours   = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60); 
    let seconds = sec - (hours * 3600) - (minutes * 60); 
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return (hours !== '00' ? hours + ':' : '') + minutes + ':' + seconds;
  },
  
  start: async function ({ nayan, events, args }) {
    if (!args.length) {
      return nayan.reply(
        '» Please provide a song name or YouTube URL (input is empty)!',
        events.threadID,
        events.messageID
      );
    }
    const keywordSearch = args.join(" ");
    const filePath = `${__dirname}/cache/1.mp3`;
    if (fs.existsSync(filePath)) { 
      fs.unlinkSync(filePath);
    }
    
    // যদি সরাসরি URL দেওয়া হয়
    if (keywordSearch.indexOf("https://") === 0) {
      try {
        var data = await downloadMusicFromYoutube(keywordSearch, filePath);
        if (fs.statSync(filePath).size > 26214400) {
          return nayan.reply(
            'Unable to send files because the capacity is greater than 25MB.',
            events.threadID,
            () => fs.unlinkSync(filePath),
            events.messageID
          );
        }
        return nayan.reply({ 
          body: `🎵 Title: ${data.title}\n⏱ Processing time: ${Math.floor((Date.now() - data.timestart)/1000)} second(s)\n🛡 ====DISME PROJECT====🛡`,
          attachment: fs.createReadStream(filePath)
        }, events.threadID, () => fs.unlinkSync(filePath), events.messageID);
      }
      catch (e) { 
        console.log(e);
      }
    } else {
      // সার্চ মোড: ইউটিউবে সার্চ করে ফলাফল দেখাবে
      try {
        let link = [],
            msg = "",
            num = 0;
        const searchData = (await Youtube.GetListByKeyword(keywordSearch, false, 6)).items;
        for (let value of searchData) {
          link.push(value.id);
          num += 1;
          msg += `${num} - ${value.title} (${value.length.simpleText})\n\n`;
        }
        var body = `» 🎧 There are ${link.length} results matching your search keyword:\n\n${msg}\n» Reply with the number of your selection.`;
        return nayan.reply({
          body: body
        }, events.threadID, (error, info) => global.client.handleReply.push({
          type: 'reply',
          name: this.config.name,
          messageID: info.messageID,
          author: events.senderID,
          link
        }), events.messageID);
      } catch(e) {
        return nayan.reply(
          'An error has occurred, please try again later!\n' + e,
          events.threadID,
          events.messageID
        );
      }
    }
  }
};
