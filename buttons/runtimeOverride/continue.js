const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const blackjack = require("discord-blackjack");

module.exports = {
  customId: "overrideTrue",

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
  async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, uuid, serverIdentifier, runtime, price) {
    await interaction.deferReply({ephemeral: true}), { user: { accentColor, id, tag }, channel } = interaction

    //Get ServerUserId
    let userId = await panel.getUserIDfromUUID(uuid)
    let data = await panel.getServerRuntime(serverIdentifier)
    let { data: { user_id: serverUserId } } = data

    //Remove Runtime from Server
    await panel.removeServerSuspensionList(uuid)
    await panel.removeServerDeletionList(uuid)

    //Set Server Runtime to new Parameters
    await panel.setServerRuntime(uuid, runtime, userId, price)

    await logManager.logString(`Server Runtime has been overwritten for UUID ${uuid}, Runtime ${runtime}, Price ${price} for User ${userId} by ${id}`)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(`\`\`\`✅ ${await t("override_runtime.override_label")} ✅\`\`\``)
        .setDescription(`\`\`\`${await t("override_runtime.override_text")}\`\`\``)
        .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true
    })
  }
}