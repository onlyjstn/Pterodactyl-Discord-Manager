const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coin-conversion")
    .setDescription("Outputs the complete amount of coins in conversion"),
  /**
  * Show user how many coins are in total conversion
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
    await interaction.deferReply({ ephemeral: true })
    let { user: { id: userId, tag }, user: user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(`\`\`\`🪙⠀${await t("coins.umlauf.coin_label")} 🪙\`\`\``)
        .setDescription(`\`\`\`${await economyManager.getTotalCoinAmount()} ${await t("coins.umlauf.coin_text")}\`\`\``)
        .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true,
    });
    //Logging
    await logManager.logString(`${tag} checked the Coins in rotation: ${await economyManager.getTotalCoinAmount()} Coins`)
  },
};
