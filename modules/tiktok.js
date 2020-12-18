const TikTokScraper = require('tiktok-scraper');
const Lang = require("./Lang").TikTok;
const Commands = require('./Commands');
const fetch = require('node-fetch');


Commands.addCommand(
    {pattern: /(https:\/\/vm\.tiktok\.com\/.*\/)/, desc: Lang.TIKTOK_DESC, usage: 'https://vm.tiktok.com/ZSs2MAo3/'},
    async (message, match) => {
        if (match[0] === '') return message.reply(Lang.NEED_URL);
        try {
            const videoMeta = await TikTokScraper.getVideoMeta(match);
            const videoAttach = await message.uploadVideo(await downloadVideo(videoMeta));
            message.reply('', videoAttach);

            message.reply(Lang.UPLOAD_WAIT);
        } catch (error) {
            console.log(error);
        }
    });

async function downloadVideo(videoMeta) {
    if (videoMeta === undefined || videoMeta.collector.length === 0 || videoMeta.collector[0].videoUrl === '') {
        throw 'Error while getting TikTok video data';
    }
    let videoUrl = videoMeta.collector[0].videoUrl
    let video = await fetch(videoUrl, {headers: videoMeta.headers})
    if (video === undefined || !video.ok) {
        throw new Error(`unexpected response ${response.statusText}`);
    }

    return await video.buffer();
}