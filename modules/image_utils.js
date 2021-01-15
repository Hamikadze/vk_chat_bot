const fetch = require('node-fetch');

async function downloadImage(imageUrl) {
    let image = await fetch(imageUrl);
    if (image === undefined || !image.ok) {
        throw new Error(`unexpected response ${image.statusText}`);
    }
    return await image.buffer();
}

module.exports = {
    downloadImage: downloadImage,
}