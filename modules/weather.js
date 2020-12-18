const Lang = require("./Lang").Weather;
const Commands = require('./Commands');
const fetch = require('node-fetch');

Commands.addCommand(
    {pattern: /\/weather ?(.*)/, desc: Lang.DESCRIPTION, usage: '/weather Пермь'},
    async (message, match) => {
        if (match[0] === '') return message.reply(Lang.NEED_LOCATION);
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURI(match[0])}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=ru`;
        try {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`unexpected response ${response.statusText}`);
            const json = await response.json();
            return await message.reply(
                `📍 ${Lang.LOCATION}: \`${match[0]}\`\n\n` +
                `☀ ${Lang.TEMP}: \`${json.main.temp_max}°\`\n` +
                `❓ ${Lang.DESC}: \`${json.weather[0].description}\`\n` +
                `💦 ${Lang.HUMI}: \`${json.main.humidity}%\`\n` +
                `💨 ${Lang.WIND}: \`${json.wind.speed + Lang.SPEED}\`\n` +
                `☁ ${Lang.CLOUD}: \`${json.clouds.all}%\``);

        } catch {
            return message.reply(Lang.NOT_FOUND);
        }
    });