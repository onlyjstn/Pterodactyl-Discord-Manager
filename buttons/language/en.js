const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder } = require("discord.js")

module.exports = {
  customId: "en",
  /**
   * Set users lamguage to "de"
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
   */
  async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t) {
    await interaction.deferReply({ ephemeral: true }), { user: { id } , user} = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    //Set User Language to Selected Option
    let translate = new TranslationManager(id), langShort = "en-US"
    await translate.saveUserLanguage(langShort)
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(`\`\`\`🌍 ${await t("language_event.main_label")} 🌍\`\`\``)
        .setDescription(`\`\`\`${await t("language_event.change_language_text")} en-US\`\`\``)
        .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true,
    });
  },
};
