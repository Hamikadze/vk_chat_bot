const wiki = require('wikijs').default;
const Lang = require("./Lang").Wiki;
const Commands = require('./Commands');
const url = `https://ru.wikipedia.org/w/api.php`;
const vk_utils = require('./vk_utils')

Commands.addCommand(
    {pattern: /^\? ?(.*)/, desc: Lang.DESCRIPTION, usage: '? Пермь'},
    async (message, match) => {
        if (match[0] === '') {
            const wikiSearch = await wiki({apiUrl: url}).random(1);
            message.reply(Lang.RANDOM_PAGE)
            return await sendWikiEmbed(message, wikiSearch);
        } else {
            message.reply(Lang.SEARCHING)
            const wikiSearch = await wiki({apiUrl: url}).search(match);
            return await sendWikiEmbed(message, wikiSearch.results);
        }
    });

async function sendWikiEmbed(message, wikiSearch) {
    if (!wikiSearch.length) {
        return message.reply(Lang.NO_INFO)
    }
    const wikiPage = await wiki({apiUrl: url}).page(wikiSearch[0]);
    const wikiSummary = await wikiPage.summary();
    const wikiImage = await wikiPage.mainImage();

    let reply =
        `🔎 \`${wikiPage.raw.title.toUpperCase()}\` \n\n`;
    if (wikiSummary.length > 2048) {
        var sumText = wikiSummary.toString().split('\n');
        reply += `${sumText.slice(0, 2).join('\n')}\n` +
            `[...]\n${Lang.CONTINUE_READING}: *${wikiPage.raw.fullurl}*`;
    } else {
        reply += wikiSummary.toString();
    }

    vk_utils.uploadImage(wikiImage, message)
        .then((imageAttach) =>
            message.reply(reply, imageAttach));
}