const { PanelManager } = require("./../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js")

module.exports = {
  customId: "addShopItemModal",
  /**
   * Create a shop item
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
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    let { fields, user: { id }, user } = interaction, itemName = fields.getTextInputValue("itemName"), itemPrice = fields.getTextInputValue("itemPrice"), itemDescription = fields.getTextInputValue("itemDescription"), itemRuntime = fields.getTextInputValue("itemRuntime"), fetchedUser = await user.fetch(true), { accentColor } = fetchedUser, itemType = "server"// maybe in the next api update :("item_type_selector ).data.values[0]

    let data = {
      name: itemName,
      type: itemType,
      price: itemPrice,
      description: itemDescription,
      runtime: itemRuntime,
    };

    //Cache Data
    await cacheManager.cacheData(id, data)

    //Check if item_price is a number
    if (isNaN(itemPrice) || itemPrice < 0 || itemPrice % 1 !== 0) {
      await interaction.editReply({
  embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`✍️ ${await t("shop_manager.main_label")} ✍️\`\`\``)
            .setDescription(`\`\`\`${await t("add_item_modal_second.price_no_number_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
  flags: MessageFlags.Ephemeral
      });
      return;
    }

    //maybe in the next api update if(item_type == 'item_server') {
    if (itemType) {
      //Reply with Confirmation
        await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`╔ ✅ ${await t("add_item_modal.confirm_label")} ✍️\`\`\``)
            .setDescription(`╠ **Item Name:** ${itemName}\n╠ **Item Type:** Server\n╠ **Item Price:** ${itemPrice}\n╠ **Item Description:** ${itemDescription}\n╚ **Server Runtime:** ${itemRuntime}`)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        flags: MessageFlags.Ephemeral,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle("Success")
              .setCustomId("addShopItemConfirm")
              .setLabel(`${await t("add_item_modal.button_confirm_text")}`),


            new ButtonBuilder()
              .setStyle("Danger")
              .setCustomId("addShopItemCancel")
              .setLabel(`${await t("add_item_modal.button_cancel_text")}`)
          )
        ],
      });
    }
  },
};
