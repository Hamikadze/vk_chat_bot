const TikTokScraper = require('tiktok-scraper');
const Lang = require("./Lang").TikTok;
const Commands = require('./Commands');
const vk_utils = require('./vk_utils');


Commands.addCommand(
    {pattern: /(https:\/\/vm\.tiktok\.com\/.*\/)/, desc: Lang.TIKTOK_DESC, usage: 'https://vm.tiktok.com/ZSs2MAo3/'},
    async (message, match) => {
        if (match[0] === '') return await message.reply(Lang.NEED_URL);
        try {
            const videoMeta = await TikTokScraper.getVideoMeta(match);
            vk_utils.uploadVideo(videoMeta, message).then((imageAttach)=>
                message.reply('', imageAttach));

            message.reply(Lang.UPLOAD_WAIT);
        } catch (error) {
            console.log(error);
        }
    });

