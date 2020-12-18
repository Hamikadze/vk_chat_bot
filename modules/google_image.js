const GoogleImages = require('google-images');
const Lang = require("./Lang").Google_image;
const Commands = require('./Commands');
const client = new GoogleImages(process.env.CSE_ID_GOOGLE, process.env.API_KEY_GOOGLE);
const fetch = require('node-fetch');

Commands.addCommand(
    {pattern: /^! ?(.*)/, desc: Lang.GIMAGE_DESC, usage: '! Пермь'},
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

async function downloadImage(imageUrl) {
    let image = await fetch(imageUrl);
    if (image === undefined || !image.ok) {
        throw new Error(`unexpected response ${image.statusText}`);
    }
    return await image.buffer();
}