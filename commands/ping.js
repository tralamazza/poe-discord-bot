// taken from https://github.com/eslachance/bot-guide/blob/episode-5/commands/ping.js
module.exports = {
    description: 'Latency check',
    run: async (client, message) => {
        message.channel.send('Pong...').then((msg) => {
            msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        });
    }
}