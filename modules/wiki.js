const wiki = require('wikijs').default;
const Lang = require("./Lang").Wiki;
const Commands = require('./Commands');
const {downloadImage} = require("./image_utils");
const url = `https://ru.wikipedia.org/w/api.php`;

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
    if (wikiSummary.length > 800) {
        let sumText = wikiSummary.toString().split('\n');
        reply += `${sumText.slice(0, 1).join('\n')}\n` +
            `[...]\n${Lang.CONTINUE_READING}: ${wikiPage.raw.fullurl}`;
    } else {
        reply += wikiSummary.toString();
    }

    const imageAttach = await message.uploadImage(await downloadImage(wikiImage));

    message.reply(reply, imageAttach !== undefined ? imageAttach : null);
}