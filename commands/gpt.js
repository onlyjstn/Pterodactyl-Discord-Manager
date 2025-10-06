const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder } = require("discord.js")
const gptKey = ""
const { Configuration, OpenAIApi } = require("openai")
const configuration = new Configuration({
    apiKey: gptKey,
})
const openai = new OpenAIApi(configuration)

// Latenz oder Umlaufzeit
module.exports = {
  data: new SlashCommandBuilder()
    .setName("gpt")
    .setDescription("OpenAI.")
    .addStringOption((option) =>
    option.setRequired(true).setName("prompt").setDescription("Prompt")),
    /**
     * Basic ping command
     * 
     * @param {BaseInteraction} interaction 
     * @param {Client} client 
     * @param {PanelManager} panel 
     * @param {BoosterManager} boosterManager 
     * @param {CacheManager} cacheManager 
     * @param {EconomyManager} economyManager 
     * @param {LogManager} logManager 
     * @param {DataBaseInterface} databaseInterface 
     * @param {TranslationManager} t 
     * @returns 
     */
  async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t) {
    //Reply to User
    await interaction.deferReply({})
    let { user: { id: userId, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    let prompt = interaction.options.getString("prompt")
    let response = await openai.createCompletion({model: "text-davinci-003", prompt: prompt, temperature: 0, max_tokens: 1000, top_p: 1, n: 1, stream: false, logprobs: null})
    console.log(response.data.choices)
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle("GPT Antwort zu deiner Frage:")
        .setColor(accentColor ? accentColor : 0xe6b04d)
        .setDescription(response.data.choices[0].text)
      ],
    });
  },
};
