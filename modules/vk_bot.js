const Commands = require('./Commands');
import('./weather.js');
import('./wiki.js');
import('./google_image.js');
import('./tiktok.js');
const easyvk = require('easyvk')

easyvk({
    utils: {
        longpoll: true,
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
                    command.func(new ctx(fullMessage.from_id, vk), [command.message])
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
            user_id: 172849894,//this.replyID,
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
}

module.exports = {
    easyvk: easyvk,
}