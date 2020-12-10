const VkBot = require('node-vk-bot-api');
//const GoogleApi = require('./google-search-api');
const Commands = require('./modules/Commands');
const vk_utils = require('./modules/vk_utils');
import('./modules/weather.js');
import('./modules/wiki.js');
import('./modules/google_image.js');
import('./modules/tiktok.js');

//vk_utils.getMessageAttachmentUrl('https://sun9-40.userapi.com/impg/y2-jk0N1wt_jyKzfMm_rpKOx7TMzlbQl6dkzfQ/kfuD06FdPVE.jpg?size=810x1080&quality=96&sign=5afa9c880242a2a016ef078611a3232b');
const bot = new VkBot(process.env.TOKEN_VK);

bot.on((ctx) => {
    let message = ctx.message.body;
    Commands.getCommand(0).func(ctx, [message]);
    /*client.search()
        .then(images => {
            if (images.length > 0)
                ctx.reply(images[0].url);
        });*/
});


bot.startPolling((err) => {
    if (err) {
        console.error(err);
    }
});
