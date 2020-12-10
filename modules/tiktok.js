const VkBot = require('node-vk-bot-api');
const bot = new VkBot(process.env.TOKEN_VK);
const got = require('got');
const FormData = require('form-data');
const TikTokScraper = require('tiktok-scraper');
const Lang = require("./Lang").TikTok;
const Commands = require('./Commands');
const {CookieJar} = require('tough-cookie');
const {promisify} = require('util');
const fs = require('fs');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);


Commands.addCommand(
    {pattern: 'weather ?(.*)', desc: Lang.TIKTOK_DESC, usage: '/weather Пермь'},
    async (message, match) => {
        if (match[0] === '') return await message.reply(Lang.NEED_LOCATION);
        try {
            const headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.27 Safari/537.36 Edg/88.0.705.15",
                "Referer": "https://www.tiktok.com/",
                "Cookie": "tt_webid_v2=6904347864236967430"
            }
            const videoMeta = await TikTokScraper.getVideoMeta(match);
            sendVideo(message, videoMeta)
        } catch (error) {
            console.log(error);
        }
    });

async function sendVideo(message, videoMeta) {
    //const getTokenUrl = `https://oauth.vk.com/authorize?client_id=${process.env.client_id}&display=page&redirect_uri=https://oauth.vk.com/blank.html&scope=friends,video,photos,audio&response_type=token&v=5.126&state=123456`
    // const access_token = await got(getTokenUrl)
    const uploadServer = await bot.execute('video.save',
        {
            name: `Мемес${Date.now()}`,
            description: `Новый топ мемес от ${Date.now()}`,
            is_private: 0,
            wallpost: 0
        });

    if (uploadServer === undefined || uploadServer.upload_url === '') {
        throw 'Error in method `video.save`';
    }

    let videoUrl = videoMeta.collector[0].videoUrl

    let video = await got(videoUrl, {headers:videoMeta.headers})

    const videoBuffer = video.rawBody;

    if (videoBuffer === undefined) {
        throw 'Error while downloading video';
    }

    const formData = new FormData();
    formData.append('video_file', videoBuffer, {filename: 'video.mp4'});

    let uploadedInfo = await got.post(uploadServer.upload_url, {
        body: formData
    });


    if (uploadedInfo === undefined) {
        throw 'Error while uploading video';
    }

    const jsonUploadedInfo = JSON.parse(uploadedInfo.body);


    message.reply('', `video${jsonUploadedInfo.owner_id}_${jsonUploadedInfo.video_id}`);
}