const fs = require('fs-extra');
const request = require('request');

module.exports.config = {
  name: 'alert',
  version: '1.0.1',
  hasPermssion: 0,
  credits: 'Joshua Sy',
  description: 'Generates an alert image with custom text using the Popcat API',
  commandCategory: 'image',
  usages: 'Add text lmao',
  cooldowns: 0,
  dependencies: {
    'fs-extra': '',
    'request': ''
  }
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const text = args.join('  ').replace(/,/g, '  ');

  if (!text) {
    return api.sendMessage('Please add some text.', threadID, messageID);
  }

  const imagePath = __dirname + '/cache/biden.png';

  try {
    const encodedText = encodeURIComponent(text);
    const imageUrl = `https://api.popcat.xyz/alert?text=${encodedText}`;

    request(imageUrl)
      .pipe(fs.createWriteStream(imagePath))
      .on('close', () => {
        api.sendMessage({
          body: '',
          attachment: fs.createReadStream(imagePath)
        }, threadID, () => fs.unlinkSync(imagePath), messageID);
      });
  } catch (error) {
    api.sendMessage('An error occurred while generating the image.', threadID, messageID);
  }
};
