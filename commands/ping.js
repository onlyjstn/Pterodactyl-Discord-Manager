const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder } = require("discord.js")

// Latenz oder Umlaufzeit
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Outputs the ping of the bot."),
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
    let { user: { id: userId, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle(":ping_pong:  Ping")
        .setColor(accentColor ? accentColor : 0xe6b04d)
        .addFields(
          {
            name: "Ping",
            value: `${interaction.client.ws.ping}ms`,
            inline: true,
          }
        )
      ],
      ephemeral: true,
    });
  },
};
