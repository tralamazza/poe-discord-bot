const path = require('path')
const Discord = require('discord.js')
const logger = require('bunyan').createLogger({ name: 'poe-bot' })
const config = require('./config.json')

const client = new Discord.Client({
    disableEveryone: true,
    disabledEvents: ['TYPING_START']
})

const talkedRecently = new Set()

process.on('exit', () => {
    client.destroy()
})

process.on('warning', (warning) => {
    logger.warn({ warning: warning.name }, warning.message)
})

process.on('unhandledRejection', (err) => {
    logger.error(err)
    process.exit(1)
})

client.on("message", message => {
    if ((message.author.bot) || (message.content.indexOf('!') !== 0)) {
        return
    }
    if (talkedRecently.has(message.author.id)) {
        return message.reply('Slow down please')
    }
    talkedRecently.add(message.author.id)
    setTimeout(() => {
        talkedRecently.delete(message.author.id)
    }, 4000)
    const args = message.content.slice(1).trim().split(/ +/g)
    const command = path.win32.basename(args.shift().toLowerCase())
    try {
        logger.debug({ command: command, args: args }, 'run')
        require(`./commands/${command}.js`).run(client, message, args)
    } catch(err) {
        logger.error(err)
    }
})

client.login(config.token)
logger.info('running')