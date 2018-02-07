const puppeteer = require('puppeteer')
const logger = require('bunyan').createLogger({ name: 'poe-bot:wiki' })

module.exports = {
    example: '!wiki scourge',
    description: 'PoE wiki item search',
    run: async function (client, message, args) {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                ignoreHTTPSError: true,
                headless: true,
                args: ['--disable-dev-shm-usage', '--no-default-browser-check', '--no-startup-window']
            })
        }
        message.reply(`searching wiki for '${args.join(' ')}'`)
        const page = await this.browser.newPage()
        try {
            await page.setJavaScriptEnabled(false)
            await page.setViewport({ width: 1920, height: 1080 })
            await page.goto(`https://pathofexile.gamepedia.com/index.php?profile=all&search=${args.join('+')}`, { waitUntil: 'networkidle0' })
            const item = await page.$('table.wikitable.sortable.item-table') || await page.$('.infobox-page-container > .item-box.-unique')
            if (item) {
                message.reply(page.url(), { file: await item.screenshot() });
            } else {
                const didyoumean = await page.$('.searchdidyoumean > a')
                if (didyoumean) {
                    const maybe = await page.evaluate(el => el.textContent, didyoumean);
                    message.reply(`Did you mean '${maybe}'`)
                } else {
                    message.reply(`'${args.join(' ')}' not found`)
                }
            }
        } catch (err) {
            logger.error(err)
            message.reply(err.message)
        } finally {
            await page.close()
        }
    }
}