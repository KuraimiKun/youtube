import youtubedl from 'youtube-dl'
import fs from 'fs'
import { Telegraf } from 'telegraf'

// Global Vars
var DOWN_URL = "https://www.youtube.com/watch?v=";
var infor;
var TeleMaxData = 50; // 50mb || This mighth change in Future!
var videosize;
var __dirname = './'
// Bot setup
const bot = new Telegraf('2109174935:AAGtxZdN1685pYXCGQFO265hoGIHIDe9IC0');
console.log('bot started');
bot.start((ctx) => ctx.reply('Hey there!\nI\'m sending Youtube videos to you!'));
bot.help((ctx) => ctx.reply('Send me a link and I will send you the vid :) \n cmds: \n \n /video {videoID}'));
bot.startPolling();

// Catch all errors from bot
bot.catch(function (err) { console.log(err) });

// Commands
bot.command('video', async (ctx) => {

  let userID = ctx.from["id"];


  let input = ctx.message.text.split(' ');
  console.log(input)
  let subSplit;
  let videoURL;

  ctx.telegram.sendMessage(538478027, `-----------NEW_DOWNLOAD_BY_${userID}-----------`);

  if (input[1].includes("https://youtu.be/")) {
    console.log(input[1])
    subSplit = input[1].split('.be/');
    videoURL = DOWN_URL + subSplit[1]
  } else {
    videoURL = DOWN_URL + input[1];
  }
  console.log(`New download Youtube video URL: ${videoURL}`);

  // Remove previous video from cache!
  if (fs.existsSync(`${__dirname}/cache/${userID}.mp4`)) {
    fs.unlink(`${__dirname}/cache/${userID}.mp4`, (err) => {
      if (err) console.log(err);
      console.log(`${__dirname}/cache/${userID}.mp4 was deleted`);
    });
  }

  // Download video
  var video = youtubedl(videoURL,
    // Optional arguments passed to youtube-dl.
    ['--format=18'],
    // Additional options can be given for calling `child_process.execFile()`.
  );

  // Will be called when the download starts.
  video.on('info', async function (info) {
    infor = info;
    videosize = infor.size / 1000000;
    console.log(videosize)

    if (videosize < TeleMaxData) {
      ctx.reply('Download Started')
     await video.pipe(fs.createWriteStream(`${__dirname}/cache/${userID}.mp4`))
      

      // Status of Download
      /* UNCOMMENT FOR DOWNLOAD STATUS IN TERMINAL
      var pos = 0;
      video.on('data', function data(chunk) {
          pos += chunk.length;
          if (infor.size) {
              let percent = (pos / infor.size * 100).toFixed(2);
              process.stdout.cursorTo(0);
              process.stdout.clearLine(1);
              process.stdout.write(percent + '%');
          }
      })
      */

      video.on('end', async function () {
        console.log("Download completed");
        try {
          ctx.reply(`Download completed!\nVideo gets Send! - This might take a few Seconds! \n \n Title: \n ${infor.title}. It's ${videosize}mb big.`);
          console.log('info', `Video gets Send! - This might take a few Seconds! \n Title: ${infor.title}, Size: ${videosize}`);
          await ctx.replyWithVideo({
            source: fs.createReadStream(`${__dirname}/cache/${userID}.mp4`)
          })
        } catch (err) {
          console.log("Error: sendVideo");
          ctx.reply('Error: sendVideo');
        }
      })
    } else {
      ctx.reply(`The Video is ${videosize}mb. The maximum size for sending videos from Telegram is ${TeleMaxData}mb.`);
      console.log(`The Video size is to big! (${videosize}mb)`);
    }
  });

})

