// Alle Imports und Requierements
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const dotenv = require('dotenv')

//Initialize DotEnv
dotenv.config({ path: './config.env'})
const token = process.env.BOT_TOKEN
const clientid = process.env.BOT_CLIENT_ID
const testserverid = process.env.BOT_SINGLE_SERVER_ID
//Dynamisches Abrufen der Slash Commands

const slashcommands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	slashcommands.push(command.data.toJSON());
}


//Initiere Slash Commands und schicke sie an die Discord API via REST

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Ich lese nun alle Slash-Commands neu aus und versende die an alle verfügbaren Server... dies kann einen Moment dauern!');

        await rest.put(
            Routes.applicationGuildCommands(clientid, testserverid),
            {body: slashcommands },
        );

        console.log('Ich habe alles erledigt und die Slash Commands wurden aktualisiert!');
    } catch (err) {
        console.log('Uppss... da ist wohl ein Fehler aufgetreten: ' + err);
    }
})();
