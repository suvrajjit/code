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

bot.on('chat', (username, message) => {
    console.log(`Received chat message from ${username}: ${message}`);

    const match = message.match(chatPattern);

    if (!match || username === bot.username) return;

    const sender = match[1];
    const content = match[2];

    console.log(`Chat message parsed: Sender: ${sender}, Content: ${content}`);

    if (!content.startsWith(prefix)) {
        return;
    }

    const args = content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log(`Received chat command from ${sender}: ${command}`);

    if (command === 'di') {
        console.log(`Echoing message: ${args.join(' ')}`);
        bot.chat(args.join(' '));
    }
    if (command === 'come') {
        console.log(`Moving towards ${sender}`);
        const target = bot.players[sender] ? bot.players[sender].entity : null;
        if (!target) {
            console.log(`Cannot see ${sender}.`);
            bot.chat(`I cannot see you, ${sender}. Try entering my chunks or getting closer to me.`);
            return;
        }
        const player = target.position;
        bot.pathfinder.setGoal(new GoalNear(player.x, player.y, player.z, 1));
    }
    if (command === 'goto') {
        console.log(`Navigating to coordinates: ${args.join(', ')}`);
        const x = parseInt(args[0]);
        const y = parseInt(args[1]);
        const z = parseInt(args[2]);
        bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
    }
    if (command === 'xz') {
        console.log(`Navigating to XZ coordinates: ${args.join(', ')}`);
        const x = parseInt(args[0]);
        const z = parseInt(args[1]);
        bot.pathfinder.setGoal(new GoalNearXZ(x, z, 1));
    }
});

bot.on('kicked', (reason, loggedIn) => {
    console.log(`Bot has been kicked. Reason: ${reason}. Logged in: ${loggedIn}`);
});

bot.on('error', (err) => {
    console.error('Bot error:', err);
});
