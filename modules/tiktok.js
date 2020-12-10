const VkBot = require('node-vk-bot-api');
const bot = new VkBot(process.env.access_token);
const got = require('got');
const FormData = require('form-data');
const TikTokScraper = require('tiktok-scraper');
const Lang = require("./Lang").TikTok;
const Commands = require('./Commands');


Commands.addCommand(
    {pattern: /https:\/\/vm\.tiktok\.com\/.*\//, desc: Lang.TIKTOK_DESC, usage: 'https://vm.tiktok.com/ZSs2MAo3/'},
    async (message, match) => {
        if (match[0] === '') return await message.reply(Lang.NEED_LOCATION);
        try {
            const videoMeta = await TikTokScraper.getVideoMeta(match);
            sendVideo(message, videoMeta)
        } catch (error) {
            console.log(error);
        }
    });

async function sendVideo(message, videoMeta) {
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

    if (videoMeta === undefined || videoMeta.collector.length === 0 || videoMeta.collector[0].videoUrl === '') {
        throw 'Error while getting TikTok video data';
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
    message.reply(Lang.UPLOAD_WAIT);
    const jsonUploadedInfo = JSON.parse(uploadedInfo.body);
    setTimeout(function() {
        message.reply('', `video${jsonUploadedInfo.owner_id}_${jsonUploadedInfo.video_id}`);
    }, 10000);
}