const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")

module.exports = {
  customId: "overrideFalse",

  /**
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
    await interaction.deferReply({ ephemeral: true }), { user: { accentColor, id, tag }, channel } = interaction

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(`\`\`\`⚠️ ${await t("errors.cancel_label")} ⚠️\`\`\``)
        .setDescription(`\`\`\`${await t("override_runtime.cancelled")}\`\`\``)
        .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true
    })

  }
}