const fs = require('fs');
const ytdl = require('ytdl-core');
const { resolve } = require('path');
const moment = require('moment-timezone');
const axios = require('axios');
const { createReadStream, unlinkSync, statSync } = require('fs-extra');

// Function to download music from YouTube
async function downloadMusicFromYoutube(link, path) {
  if (!link) return 'No link provided!';
  const timestart = Date.now();

  return new Promise((resolve, reject) => {
    ytdl(link, {
      filter: (format) => format.quality === 'tiny' && format.audioBitrate === 128 && format.hasAudio,
    }).pipe(fs.createWriteStream(path))
      .on('close', async () => {
        try {
          const data = await ytdl.getInfo(link);
          const result = {
            title: data.videoDetails.title,
            dur: Number(data.videoDetails.lengthSeconds),
            viewCount: data.videoDetails.viewCount,
            likes: data.videoDetails.likes,
            uploadDate: data.videoDetails.uploadDate,
            sub: data.videoDetails.author.subscriber_count,
            author: data.videoDetails.author.name,
            timestart: timestart,
          };
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
  });
}

// Command configuration
module.exports.config = {
  name: 'sing',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'D-Jukie',
  description: 'Download and play music from YouTube',
  commandCategory: 'Utilities',
  usages: '[searchMusic]',
  cooldowns: 0,
};

// Convert seconds to HH:mm:ss format
module.exports.convertHMS = function (value) {
  const sec = parseInt(value, 10);
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - (hours * 3600)) / 60);
  let seconds = sec - (hours * 3600) - (minutes * 60);
  return `${hours ? `${hours}:` : ''}${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

// Handle reply for music download
module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    const path = `${__dirname}/cache/sing-${event.senderID}.mp3`;
    const data = await downloadMusicFromYoutube('https://www.youtube.com/watch?v=' + handleReply.link[event.body - 1], path);

    // File size check (limit to 25MB)
    if (statSync(path).size > 26214400) {
      return api.sendMessage('File too large. Please choose another song!', event.threadID, () => fs.unlinkSync(path), event.messageID);
    }

    api.unsendMessage(handleReply.messageID);
    return api.sendMessage({
      body: `🎶=====「 𝐌𝐔𝐒𝐈𝐂 」=====️🎶\n━━━━━━━━━━━━━━\n📌 → 𝗧𝗶𝘁𝗹𝗲: ${data.title} ( ${this.convertHMS(data.dur)} )\n📆 → 𝗡𝗴𝗮̀𝘆 𝘁𝗮̉𝗶 𝗹𝗲̂𝗻: ${data.uploadDate}\n📻 → 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${data.author} ( ${data.sub} )\n👀 → 𝗟𝘂̛𝗼̛̣𝘁 𝘅𝗲𝗺: ${data.viewCount} 𝘃𝗶𝗲𝘄\n❤️ → 𝗟𝘂̛𝗼̛̣𝘁 𝘁𝗵𝗶́𝗰𝗵: ${data.likes}\n⏳ → 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘅𝘂̛̉ 𝗹𝘆́: ${Math.floor((Date.now() - data.timestart) / 1000)} seconds`,
      attachment: fs.createReadStream(path),
    }, event.threadID, () => fs.unlinkSync(path), event.messageID);
  } catch (e) {
    console.error(e);
    api.sendMessage('An error occurred. Please try again later.', event.threadID, event.messageID);
  }
};

// Run function for user input (search or link)
module.exports.run = async function ({ api, event, args }) {
  const path = `${__dirname}/cache/sing-${event.senderID}.mp3`;

  if (args.length === 0 || !args) return api.sendMessage('Please provide a search query or YouTube link!', event.threadID, event.messageID);

  // Clear cache file if it exists
  if (fs.existsSync(path)) fs.unlinkSync(path);

  // If the argument is a YouTube link, download directly
  if (args[0].startsWith('https://')) {
    try {
      const data = await downloadMusicFromYoutube(args[0], path);

      // File size check (limit to 25MB)
      if (statSync(path).size > 26214400) {
        return api.sendMessage('File is too large. Please choose a different song!', event.threadID, () => fs.unlinkSync(path), event.messageID);
      }

      return api.sendMessage({
        body: `🎶=====「 𝐌𝐔𝐒𝐈𝐂 」=====️🎶\n━━━━━━━━━━━━━━\n📌 → 𝗧𝗶𝘁𝗹𝗲: ${data.title} ( ${this.convertHMS(data.dur)} )\n📆 → 𝗡𝗴𝗮̀𝘆 𝘁𝗮̉𝗶 𝗹𝗲̂𝗻: ${data.uploadDate}\n📻 → 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${data.author} ( ${data.sub} )\n👀 → 𝗟𝘂̛𝗼̛̣𝘁 𝘅𝗲𝗺: ${data.viewCount} 𝘃𝗶𝗲𝘄\n❤️ → 𝗟𝘂̛𝗼̛̣𝘁 𝘁𝗵𝗶́𝗰𝗵: ${data.likes}\n⏳ → 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘅𝘂̛̉ 𝗹𝘆́: ${Math.floor((Date.now() - data.timestart) / 1000)} seconds`,
        attachment: fs.createReadStream(path),
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    } catch (e) {
      console.error(e);
      return api.sendMessage('An error occurred while downloading the song. Please try again!', event.threadID, event.messageID);
    }
  } else {
    // If the argument is a search keyword, search YouTube and send results
    try {
      const searchQuery = args.join(' ');
      const youtube = require('youtube-search-api');
      const searchResults = await youtube.GetListByKeyword(searchQuery, false, 6);

      let msg = '';
      const link = [];
      const imgThumbnails = [];
      let num = 0;

      for (const result of searchResults.items) {
        link.push(result.id);
        const thumbnailPath = `${__dirname}/cache/${num + 1}.png`;
        const thumbnailLink = `https://img.youtube.com/vi/${result.id}/hqdefault.jpg`;

        const thumbnailData = await axios.get(thumbnailLink, { responseType: 'arraybuffer' });
        fs.writeFileSync(thumbnailPath, Buffer.from(thumbnailData.data, 'utf-8'));
        imgThumbnails.push(fs.createReadStream(thumbnailPath));

        msg += `${num + 1}. ${result.title} ( ${result.length.simpleText} )\n📻 → 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${result.snippet.channelTitle}\n━━━━━━━━━━━━━━\n`;
        num++;
      }

      const body = `Found ${link.length} results for your search:\n━━━━━━━━━━━━━━\n${msg}Please reply with the number of the song you want to choose!`;

      return api.sendMessage({
        attachment: imgThumbnails,
        body: body,
      }, event.threadID, (error, info) => {
        global.client.handleReply.push({
          type: 'reply',
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          link,
        }), event.messageID;
      });
    } catch (e) {
      console.error(e);
      return api.sendMessage('An error occurred while searching for songs. Please try again!', event.threadID, event.messageID);
    }
  }
};
