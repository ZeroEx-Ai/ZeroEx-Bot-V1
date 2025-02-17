const fs = require("fs");
const axios = require("axios");
const { createReadStream, unlinkSync, statSync } = require("fs-extra");
const nayanDownloader = require("nayan-videos-downloader");
const Youtube = require("youtube-search-api");

/**
 * YouTube লিঙ্ক থেকে গান ডাউনলোড করে নির্দিষ্ট ফাইলে সেভ করে
 * @param {string} link - YouTube লিঙ্ক
 * @param {string} filePath - ফাইল সেভ করার পাথ
 * @returns {Promise<object>} - গানটির শিরোনাম ও প্রসেসিং সময়সহ অবজেক্ট
 */
async function downloadMusicFromYoutube(link, filePath) {
  if (!link) return Promise.reject("Link Not Found");
  const timestart = Date.now();

  try {
    const data = await nayanDownloader.ytdown(link);
    const audioUrl = data.data.video;

    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        url: audioUrl,
        responseType: "stream",
      })
        .then((response) => {
          const writeStream = fs.createWriteStream(filePath);
          response.data
            .pipe(writeStream)
            .on("finish", async () => {
              try {
                const info = await nayanDownloader.ytdown(link);
                resolve({
                  title: info.data.title,
                  timestart: timestart,
                });
              } catch (error) {
                reject(error);
              }
            })
            .on("error", (error) => {
              reject(error);
            });
        })
        .catch((error) => {
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
    hasPermssion: 0,
    credits: "Nayan",
    description: "Download song from YouTube by URL or search keyword",
    commandCategory: "Media",
    usages: "song [YouTube URL|search keyword]",
    cooldowns: 5,
    dependencies: {
      axios: "",
      fs: "",
      "nayan-videos-downloader": "",
      "simple-youtube-api": "",
    },
  },

  /**
   * handleReply: যখন ইউজার সার্চের ফলাফল থেকে কোনো বিকল্প নির্বাচন করবে
   */
  handleReply: async function ({ api, event, handleReply }) {
    try {
      const filePath = `${__dirname}/cache/1.mp3`;
      const selectedIndex = parseInt(event.body) - 1;
      const selectedLink = "https://www.youtube.com/watch?v=" + handleReply.link[selectedIndex];

      const data = await downloadMusicFromYoutube(selectedLink, filePath);
      if (statSync(filePath).size > 26214400)
        return api.sendMessage(
          "The file cannot be sent because the capacity is greater than 25MB.",
          event.threadID,
          () => unlinkSync(filePath),
          event.messageID
        );
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(
        {
          body: `🎵 Title: ${data.title}\n⏱ Processing time: ${Math.floor(
            (Date.now() - data.timestart) / 1000
          )} second(s)\n🛡 ====DISME PROJECT====🛡`,
          attachment: createReadStream(filePath),
        },
        event.threadID,
        () => unlinkSync(filePath),
        event.messageID
      );
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * run: ইউজার যখন song কমান্ড কল করবে তখন এই ফাংশনটি চলবে
   */
  run: async function ({ nayan, events, args }) {
    if (!args.length)
      return nayan.reply(
        "Please provide a song name or YouTube URL.",
        events.threadID,
        events.messageID
      );

    const input = args.join(" ");
    const filePath = `${__dirname}/cache/1.mp3`;

    // পূর্বের cache ফাইল থাকলে মুছে ফেলা
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // সরাসরি YouTube URL দেওয়া হলে
    if (input.indexOf("https://") === 0) {
      try {
        const data = await downloadMusicFromYoutube(input, filePath);
        if (statSync(filePath).size > 26214400)
          return nayan.reply(
            "Unable to send files because the capacity is greater than 25MB.",
            events.threadID,
            () => fs.unlinkSync(filePath),
            events.messageID
          );
        return nayan.reply(
          {
            body: `🎵 Title: ${data.title}\n⏱ Processing time: ${Math.floor(
              (Date.now() - data.timestart) / 1000
            )} second(s)\n🛡 ====DISME PROJECT====🛡`,
            attachment: fs.createReadStream(filePath),
          },
          events.threadID,
          () => fs.unlinkSync(filePath),
          events.messageID
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      // সার্চ মোড: ইউটিউবে সার্চ করে ফলাফল দেখাবে
      try {
        let link = [],
          msg = "",
          num = 0;
        const data = (await Youtube.GetListByKeyword(input, false, 6)).items;
        for (let value of data) {
          link.push(value.id);
          num += 1;
          msg += `${num} - ${value.title} (${value.length.simpleText})\n\n`;
        }
        const body = `🎧 There are ${link.length} results matching your search:\n\n${msg}\nReply with the number of your selection.`;
        return nayan.reply(
          { body: body },
          events.threadID,
          (error, info) =>
            global.client.handleReply.push({
              type: "reply",
              name: this.config.name,
              messageID: info.messageID,
              author: events.senderID,
              link: link,
            }),
          events.messageID
        );
      } catch (e) {
        return nayan.reply(
          "An error has occurred, please try again later!\n" + e,
          events.threadID,
          events.messageID
        );
      }
    }
  },
};
