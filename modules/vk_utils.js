const VkBot = require('node-vk-bot-api');
const bot = new VkBot(process.env.TOKEN_VK);
const got = require('got');
const FormData = require('form-data');

async function uploadImage(imageUrl) {

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
    return `photo${response[0].owner_id}_${response[0].id}`;
}

module.exports = {
    uploadImage: uploadImage,
}