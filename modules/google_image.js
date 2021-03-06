const GoogleImages = require('google-images');
const Lang = require("./Lang").Google_image;
const Commands = require('./Commands');
const client = new GoogleImages(process.env.CSE_ID_GOOGLE, process.env.API_KEY_GOOGLE);
const {downloadImage} = require("./image_utils");

Commands.addCommand(
    {pattern: /^! ?(.*)/, desc: Lang.DESCRIPTION, usage: '! Пермь'},
    async (message, match) => {

        if (match[0] === '') return message.reply(Lang.NEED_QUERY);
        client.search(match[0])
            .then(async images => {
                if (images.length > 0) {
                    let imageAttach = undefined;
                    for (const image of images) {
                        imageAttach = await message.uploadImage(await downloadImage(image.url));
                        if (imageAttach !== undefined) break;
                    }
                    if (imageAttach !== undefined)
                        message.reply('', imageAttach);
                }
            });
    });