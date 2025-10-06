const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")


module.exports = {
  customId: "addShopItemCancel",

  /**
   * Delete server
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
    let { user: { id, accentColor, tag } } = interaction
    await interaction.deferReply({ephemeral: true});
    //Delete Cache
    await cacheManager.clearCache(id)
    //reply to cancel button
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`✍️ ${await t("add_item_modal_confirm.main_label")} ✍️\`\`\``)
          .setDescription(`\`\`\`${await t("add_item_modal_confirm.item_cancelled_text")}\`\`\``)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true
    });
    //Logging
    await logManager.logString(`${interaction.user.tag} cancelled his action to add a shop item.`)
  },
};
