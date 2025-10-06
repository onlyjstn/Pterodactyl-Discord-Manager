const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Buy Servers with Coins"),
  /**
   * Shop
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
    let { user: { id: userId, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    let userData = await databaseInterface.getObject(userId), shopItems = await databaseInterface.getObject("shop_items_servers");
    //Check if User has an Account
    if (userData == null) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("shop.no_account_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true,
      });
      //Logging
      await logManager.logString(`${tag} tried to use /shop without an Account`)
      return;
    }

    //Create Embed
    let shopEmbed = new EmbedBuilder()
      .setTitle(`╔ :shopping_cart: ${await t("shop.main_label")}`)
      .setDescription(`╠ ${await t("shop.main_text")}`)
      .setColor(accentColor ? accentColor : 0xe6b04d)
      .setTimestamp();


    //Create Select Menu
    let shopSelect = new StringSelectMenuBuilder()
        .setCustomId("createSelectedItem")

    //Check if Shop is empty
    switch (shopItems == null) {
      case true: {
        //Empty
        shopEmbed.addFields([
          {
            name: `╠ :x: ${await t("shop.no_items_label")}`,
            value: `╚ ${await t("shop.no_items_text")}`,
          }
        ]);

        await interaction.editReply({
          embeds: [shopEmbed],
          ephemeral: true
        })
        break;
      }
      case false: {
        //Not empty
        for (let item of shopItems) {
          //Add Embed Fields
          shopEmbed.addFields([
            {
              name: `\u200b`,  // \u200b is a whitespace character
              value: `\`\`\`╠ 📜 ${await t("add_item_button.modal_name")} ${item.data.name}\n╠ 💵 ${await t("add_item_button.modal_price")} ${item.data.price} Coins\n╠ 📖 ${await t("add_item_button.modal_description")} ${item.data.description}\`\`\``,
            },
          ])
          //Add Select Menu Fields
          shopSelect.addOptions([
            {
              label: `${await t("shop.item_label")} #${shopItems.indexOf(item)}`,
              description: `${item.data.name}`,
              value: `${shopItems.indexOf(item)}`,
            },
          ])
        }
        await interaction.editReply({
          embeds: [shopEmbed],
          components: [new ActionRowBuilder().addComponents(shopSelect)],
          ephemeral: true
        })
      }
    }
  }
};
