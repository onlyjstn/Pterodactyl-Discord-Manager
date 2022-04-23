// Alle requires und Requierements
const dotenv = require('dotenv');

//Initializte DotEnv
dotenv.config({
	path: './config.env'
})

const {
	GatewayIntentBits,
	Partials
} = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
	partials: [Partials.Channel]
});
const fs = require('fs');
const {
	Client,
	Collection,
	Intents
} = require('discord.js');
const clientid = process.env.BOT_CLIENT_ID
const token = process.env.BOT_TOKEN
const system = require('./functions');



const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

//Client Event Handler

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
//Client Command Export Handler

client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.data.name, command)
}

//Verwende und Antworte auf Slash-Commands

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(error)
		await interaction.channel.send({
			content: 'Tut mir leid! Während ich veruscht habe diesen Command auszuführen ist mir ein Fehler unterlaufen... Probiere es gerne noch einmal.',
			ephemeral: true
		});
	}
});


//Startup Log

client.on('ready', () => {
	console.log('Hallo! Ich wurde erfolgreich eingeloggt als folgender Client: ' + client.user.tag + '!');
});



//Login Bot
client.login(token);
