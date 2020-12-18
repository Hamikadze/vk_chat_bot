require('dotenv').config()
const Commands = require('./modules/Commands');
import('./modules/weather.js');
import('./modules/wiki.js');
import('./modules/google_image.js');
import('./modules/tiktok.js');
const easyvk = require("easyvk");
const FormData = require('form-data');
const fetch = require('node-fetch');
const FileType = require('file-type');
const sleep = require('util').promisify(setTimeout);

easyvk({
    utils: {
        longpoll: true,
        uploader: true,
    },
    username: process.env.login,
    password: process.env.password,
}).then(async (vk) => {
    // после авторизации вы получаете объект EasyVK (vk), с которым работаете дальше

    // user_id авторизованного аккаунта (по токену)
    async function getMessage(msgArray = []) {
        const MESSAGE_ID__INDEX = 1;

        return vk.call('messages.getById', {
            message_ids: msgArray[MESSAGE_ID__INDEX]
        })
    }

    // Подключаемся к серверу для "прослушивания" пользователя
    vk.longpoll.connect().then((connection) => {

        // Слушаем сообщения пользователя
        connection.on('message', async (msg) => {

            // сообщение для User LongPoll хранится в массиве
            let fullMessage = await getMessage(msg);
            fullMessage = fullMessage.items[0];

            if (!fullMessage.out) {
                let command = Commands.perseCommand(fullMessage.text);
                if (command !== undefined)
                    command.func(new ctx(fullMessage.peer_id, vk), [command.message])
            }
        })
    })
}).catch(console.error)

class ctx {
    replyID;
    vk;

    constructor(replyID, vk) {
        this.replyID = replyID;
        this.vk = vk;
    }

    reply(message, attachment) {
        // Обращаемся к методу messages.send с параметром user_id и message
        this.vk.call('messages.send', {
            peer_id: this.replyID,
            message: message, // Текст сообщения, по мануалу ВКонтакте
            attachment: attachment,
            random_id: easyvk.randomId()
        }).then((response) => {
            // После выполнения запроса, ВКонтакте возвращает ответ
            console.log(response)
            // Получить полный ответ, а не только его часть response
            console.log(response.getFullResponse())
        }).catch((error) => {
            // Если произойдет ошибка при отправке запроса, она выводится в консоль
            console.log(error);
        });
    }

    async send(endPoint, args = {}) {
        return await this.vk.call(endPoint, args).then((response) => {
            // После выполнения запроса, ВКонтакте возвращает ответ
            return response;
        }).catch((error) => {
            // Если произойдет ошибка при отправке запроса, она выводится в консоль
            console.log(error);
        });
    }

    async uploadImage(buffer) {
        const uploadServer = await this.send('photos.getMessagesUploadServer', {});

        if (uploadServer === undefined || uploadServer.upload_url === '') {
            throw 'Error in method `photos.getMessagesUploadServer`';
        }
        const formData = new FormData();
        const fileType = await FileType.fromBuffer(buffer);
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

        let response = await this.send('photos.saveMessagesPhoto', {
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

    async uploadVideo(buffer) {

        const uploadServer = await this.send('video.save',
            {
                name: `Мемес${Date.now()}`,
                description: `Новый топ мемес от ${Date.now()}`,
                is_private: 1,
                wallpost: 0
            });

        if (uploadServer === undefined || uploadServer.upload_url === '') {
            throw 'Error in method `video.save`';
        }

        const fileType = await FileType.fromBuffer(buffer);
        const formData = new FormData();
        formData.append('video_file', buffer, {filename: `video.${fileType.ext}`});

        const uploadedInfo = await fetch(uploadServer.upload_url, {
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
}