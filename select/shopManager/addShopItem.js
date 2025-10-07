const { PanelManager } = require("../../classes/panelManager")
const { TranslationManager } = require("./../../classes/translationManager")
const { BoosterManager } = require("./../../classes/boosterManager")
const { CacheManager } = require("./../../classes/cacheManager")
const { EconomyManager } = require("./../../classes/economyManager")
const { LogManager } = require("./../../classes/logManager")
const { DataBaseInterface } = require("./../../classes/dataBaseInterface")
const { UtilityCollection } = require("./../../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js")

module.exports = {
  customId: "addShopItem",
  /**
   * 
   * Account manager select menu options
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
    let { user: { id: userId, tag }, user } = interaction, shopItems = await databaseInterface.getObject("shop_items_servers"), fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    //Check if there are more than 24 items currently in the shop
    if(!shopItems) shopItems = 0
    switch (shopItems.length >= 24) {
      //More than 24 Items
      case true: {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
              .setDescription(`\`\`\`${await t("add_item_button.twentyfour_limit_text")}\`\`\``)
              .setColor(accentColor ? accentColor : 0xe6b04d)
          ],
          flags: MessageFlags.Ephemeral
        })
        //Logging
        await logManager.logString(`${tag} tried to add more than 24 Items to the Shop.`)
        break;
      }
      //Less than 24 Items
      case false: {
        //Create and show modal
        let itemModal = new ModalBuilder()
          .setCustomId("addShopItemModal")
          .setTitle(`${await t("shop_manager.main_label")}`)

        let itemName = new TextInputBuilder()
          .setCustomId("itemName")
          .setLabel(`${await t("add_item_button.modal_name")}`)
          .setStyle(TextInputStyle.Short)

        let itemPrice = new TextInputBuilder()
          .setCustomId("itemPrice")
          .setLabel(`${await t("add_item_button.modal_price")}`)
          .setStyle(TextInputStyle.Short)

        let itemDescription = new TextInputBuilder()
          .setCustomId("itemDescription")
          .setLabel(`${await t("add_item_button.modal_description")}`)         // Maybe later :(   Modal Select Menus got removed in a new discord.js patch 
          .setStyle(TextInputStyle.Short)

        let itemRuntime = new TextInputBuilder()
          .setCustomId("itemRuntime")
          .setLabel(`${await t("add_item_button.modal_runtime")}`)
          .setStyle(TextInputStyle.Short)

        itemModal.addComponents([
          new ActionRowBuilder().addComponents([itemName]),
          new ActionRowBuilder().addComponents([itemPrice]),
          new ActionRowBuilder().addComponents([itemDescription]),
          new ActionRowBuilder().addComponents([itemRuntime])
        ])

        await interaction.showModal(itemModal)
        return;
      }
    }

  }
}