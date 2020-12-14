const FormData = require('form-data');
const fetch = require('node-fetch');
const FileType = require('file-type');
const sleep = require('util').promisify(setTimeout);

async function uploadImage(imageUrl, ctx) {
    let image = await fetch(imageUrl, {headers: {Accept: 'image/png'}});
    if (image === undefined || !image.ok) {
        throw new Error(`unexpected response ${image.statusText}`);
    }


    const uploadServer = await ctx.send('photos.getMessagesUploadServer', {});

    if (uploadServer === undefined || uploadServer.upload_url === '') {
        throw 'Error in method `photos.getMessagesUploadServer`';
    }
    const formData = new FormData();
    let buffer = await image.buffer();
    let fileType = await FileType.fromBuffer(buffer);
    if (fileType === undefined || !/image\/.*/.test(fileType.mime))
        return undefined;
    formData.append('photo', buffer, {filename: `image.${fileType.ext}`});
    let uploadedInfo = await fetch(uploadServer.upload_url, {
        method: 'POST',
        body: formData
    });


    if (uploadedInfo === undefined || !uploadedInfo.ok) {
        throw new Error(`unexpected response ${uploadedInfo.statusText}`);
    }

    const jsonUploadedInfo = await uploadedInfo.json();

    let response = await ctx.send('photos.saveMessagesPhoto', {
        server: jsonUploadedInfo.server,
        photo: jsonUploadedInfo.photo,
        hash: jsonUploadedInfo.hash
    });
    if (response.length === 0 || response[0] === undefined || response[0].owner_id === undefined || response[0].id === undefined) {
        throw 'Error in method `photos.saveMessagesPhoto`';
    }
    response = response[0];
    return `photo${response.owner_id}_${response.id}`;
}

async function uploadVideo(videoMeta, ctx) {
    if (videoMeta === undefined || videoMeta.collector.length === 0 || videoMeta.collector[0].videoUrl === '') {
        throw 'Error while getting TikTok video data';
    }
    let videoUrl = videoMeta.collector[0].videoUrl
    let video = await fetch(videoUrl, {headers: videoMeta.headers})
    if (video === undefined || !video.ok) {
        throw new Error(`unexpected response ${response.statusText}`);
    }

    const uploadServer = await ctx.send('video.save',
        {
            name: `Мемес${Date.now()}`,
            description: `Новый топ мемес от ${Date.now()}`,
            is_private: 1,
            wallpost: 0
        });

    if (uploadServer === undefined || uploadServer.upload_url === '') {
        throw 'Error in method `video.save`';
    }

    let buffer = await video.buffer();
    let fileType = await FileType.fromBuffer(buffer);
    const formData = new FormData();
    formData.append('video_file', buffer, {filename: `video.${fileType.ext}`});

    let uploadedInfo = await fetch(uploadServer.upload_url, {
        method: 'POST',
        body: formData
    });


    if (uploadedInfo === undefined) {
        throw 'Error while uploading video';
    }
    const response = await uploadedInfo.json();
    await sleep(5000);
    return `video${response.owner_id}_${response.video_id}`;
}

module.exports = {
    uploadImage: uploadImage,
    uploadVideo: uploadVideo,
}