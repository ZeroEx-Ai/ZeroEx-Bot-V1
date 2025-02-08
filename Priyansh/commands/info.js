module.exports.config = {
	name: "info",
	version: "1.0.1", 
	hasPermssion: 0,
	credits: "Adi.0X",
	description: "Admin and Bot info.",
	commandCategory: "About",
	cooldowns: 1,
	dependencies: 
	{
    "request":"",
    "fs-extra":"",
    "axios":""
  }
};
module.exports.run = async function({ api,event,args,client,Users,Threads,__GLOBAL,Currencies }) {
const axios = global.nodemodule["axios"];
const request = global.nodemodule["request"];
const fs = global.nodemodule["fs-extra"];
const time = process.uptime(),
		hours = Math.floor(time / (60 * 60)),
		minutes = Math.floor((time % (60 * 60)) / 60),
		seconds = Math.floor(time % 60);
const moment = require("moment-timezone");
var juswa = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【HH:mm:ss】");
var link =                                     
["https://i.imgur.com/S4hyVlL.png"];
var callback = () => api.sendMessage({body:`╭────𝗕𝗼𝘁 𝗜𝗻𝗳𝗼───◆
⋄Bot Name: ${global.config.BOTNAME}
⋄Prefix: ${global.config.PREFIX}
⋄Bot Owner: ${global.config.ADMIN}
⋄Time Now: ${juswa}
⋄Bot active time: ${hours}:${minutes}:${seconds}
⋄Bot Admin Link: ${global.config.ADMINFB}

Thanks for using ${global.config.BOTNAME}!
╰──────────────◆`,attachment: fs.createReadStream(__dirname + "/cache/juswa.png")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/juswa.png")); 
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/juswa.png")).on("close",() => callback());
   };
