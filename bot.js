const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalNear, GoalNearXZ } = require('mineflayer-pathfinder').goals;

const prefix = '!';

const bot = mineflayer.createBot({
    host: 'mc.herobrine.org',
    username: 'p1xy',
});

bot.loadPlugin(pathfinder);

const chatPattern = /Received chat message from (\w+): (.+)/;

bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);

    const defaultMove = new Movements(bot, mcData);

    defaultMove.allow1by1towers = false;
    defaultMove.canDig = true;
    defaultMove.allowParkour = true;
    defaultMove.allowSprinting = true;
    defaultMove.scaffoldingBlocks = [];
    defaultMove.scaffoldingBlocks.push(mcData.itemsByName['dirt'].id);

    bot.pathfinder.setMovements(defaultMove);

    mineflayerViewer(bot, { port: 3007, firstPerson: true });

    console.log('Bot has spawned. Sending initial chat message...');
    bot.chat('/game hera');
});

bot.on('respawn', () => {
    console.log('Bot has respawned. Sending chat message after world change...');
    bot.chat('/game hera');
});

bot.on('messagestr', async (message) => {
    console.log(`Received raw chat message: ${message}`);

    const match = message.match(chatPattern);
    if (!match) return;

    const sender = match[1];
    const content = match[2];

    console.log(`Trimmed chat message: Sender: ${sender}, Content: ${content}`);

    if ((sender === 'MVP++ Suvrajit' || sender === 'MVP++ ~Suv') && content.includes('!cmd')) {
        // Insert your command handling code here
        const command = content.slice(5).trim(); // Remove "!cmd" from the message
        handleChatCommand(sender, command);
    }
});

bot.on('kicked', (reason, loggedIn) => {
    console.log(`Bot has been kicked. Reason: ${reason}. Logged in: ${loggedIn}`);
});

bot.on('error', (err) => {
    console.error('Bot error:', err);
});

// Command handling function
function handleChatCommand(sender, command) {
    const args = command.split(' ');
    const cmd = args.shift().toLowerCase();

    console.log(`Received chat command from ${sender}: ${cmd}`);
    
    if (cmd === 'di') {
        console.log(`Echoing message: ${args.join(' ')}`);
        bot.chat(args.join(' '));
    }
    // Add other command handling logic here...
}
