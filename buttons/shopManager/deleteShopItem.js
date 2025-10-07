const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js");
const { data } = require("../../commands/serverManager");


module.exports = {
  customId: "deleteShopItem",

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

    await interaction.update({
      components: [
        new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle("Danger")
          .setCustomId("deleteShopItem")
          .setDisabled(true)
          .setLabel(`${await t("shop_manager_delete.button_label")}`)
    )],
      flags: MessageFlags.Ephemeral
    });

    let { user: { tag, id, accentColor }, message: { embeds } } = interaction, { data: { fields } } = embeds[0], { value } = fields[0], itemIndex = value.replaceAll("`", "")
    let textToSplit = interaction.message.embeds[0].data.fields[0].value;

    //Delete item from database
    await databaseInterface.removeShopItem(itemIndex)

    //Reply to user
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`✍️ ${await t("shop_manager_delete.main_label")} ✍️\`\`\``)
          .setDescription(`\`\`\`${await t("shop_manager_delete.item_deleted_text")}\`\`\``)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      flags: MessageFlags.Ephemeral,
    });

    //Logging
    await logManager.logString(`${interaction.user.tag} deleted a Shop Item with the ID: ${itemIndex}`)
  },
};
