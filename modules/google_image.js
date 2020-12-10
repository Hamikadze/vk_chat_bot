const VkBot = require('node-vk-bot-api');
const bot = new VkBot(process.env.TOKEN_VK);
const got = require('got');
const FormData = require('form-data');
const GoogleImages = require('google-images');
const Lang = require("./Lang").Google_image;
const Commands = require('./Commands');
const client = new GoogleImages(process.env.CSE_ID_GOOGLE, process.env.API_KEY_GOOGLE);

Commands.addCommand(
    {pattern: '\! ?(.*)', desc: Lang.GIMAGE_DESC, usage: '! Пермь'},
    async (message, match) => {

        if (match[0] === '') return await message.reply(Lang.NEED_QUERY);
        client.search(match[0])
            .then(images => {
                if (images.length > 0)
                    sendImage(message, images[0].url);
            });
    });

async function sendImage(message, imageUrl) {
    const uploadServer = await bot.execute('photos.getMessagesUploadServer', {});

    if (uploadServer === undefined || uploadServer.upload_url === '') {
        throw 'Error in method `photos.getMessagesUploadServer`';
    }
    let image = await got(imageUrl);
    if (image === undefined) {
        throw 'Error while downloading image';
    }

    const formData = new FormData();
    formData.append('photo', image.rawBody, {filename: 'image.png'});
    let uploadedInfo = await got.post(uploadServer.upload_url, {
        body: formData
    });


    if (uploadedInfo === undefined) {
        throw 'Error while uploading image';
    }

    const jsonUploadedInfo = JSON.parse(uploadedInfo.body);

    const response = await bot.execute('photos.saveMessagesPhoto', {
        server: jsonUploadedInfo.server,
        photo: jsonUploadedInfo.photo,
        hash: jsonUploadedInfo.hash
    });
    if (response.length === 0 || response[0] === undefined || response[0].owner_id === undefined || response[0].id === undefined) {
        throw 'Error in method `photos.saveMessagesPhoto`';
    }
    message.reply('',`photo${response[0].owner_id}_${response[0].id}`);
}