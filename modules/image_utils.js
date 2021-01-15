const fetch = require('node-fetch');
const sharp = require("sharp");

async function downloadImage(imageUrl) {
    let image = await fetch(imageUrl);
    if (image === undefined || !image.ok) {
        throw new Error(`unexpected response ${image.statusText}`);
    }
    return await image.buffer();
}

async function resizeImage(input, width = 1080, format = 'jpeg'){
    const output = await sharp(input)
        .resize({
            width: width,
            fit: sharp.fit.inside,
            withoutEnlargement: true
        })
        .toFormat(format)
        .toBuffer();
    return output !== undefined ? output : undefined;
}

module.exports = {
    downloadImage: downloadImage,
    resizeImage: resizeImage,
}