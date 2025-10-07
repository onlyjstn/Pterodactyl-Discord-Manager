const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, MessageFlags } = require("discord.js")
const dotenv = require("dotenv");
//Initializte DotEnv
dotenv.config({
  path: "../config.env",
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop-manager")
    .setDescription("Admin Command to manage the shop"),
  /**
   * Admin-command for managing the /shop
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
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    let { user: { id: userId, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser, userData = await databaseInterface.getObject(userId)
    let shopItems = await databaseInterface.getObject("shop_items_servers");
    //Check if User is on the Admin List
    switch (process.env.ADMIN_LIST.includes(userId)) {
      case false: {
        //Reply that the User is no Admin
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`\`\`\`⛔ ${await t("errors.no_admin_label")} ⛔\`\`\``)
              .setDescription(`\`\`\`${await t("errors.no_admin_text")}\`\`\``)
              .setColor(accentColor ? accentColor : 0xe6b04d)
          ],
            flags: MessageFlags.Ephemeral,
        });
        //Logging
        await logManager.logString(`${tag} tried to use /shop_manager without admin permissions`)
        break;
      }
      case true: {
        //Create Embed
        let shopEmbed = new EmbedBuilder()
          .setTitle(`╔ :gear: ${await t("shop_manager.main_label")}`)
          .setDescription(`╠ ${await t("shop_manager.main_text")}`)
          .setColor(accentColor ? accentColor : 0xe6b04d)
          .setTimestamp();


        //Create Select Menu
        let shopSelect = new StringSelectMenuBuilder()
          .setCustomId("selectShopItem")

        //Add add shop item select option
        shopSelect.addOptions([
          {
            label: `${await t("shop_manager.add_item_label")}`,
            description: `➕ ${await t("shop_manager.add_item_text")}`,
            value: "addShopItem",
          },
        ])


        //Check if Shop is empty
        switch (shopItems == null) {
          case true: {
            //Shop is empty
            shopEmbed.addFields([
              {
                name: `╠ :x: ${await t("shop_manager.no_items_label")}`,
                value: `╚ ${await t("shop_manager.no_items_text")}`,
              },
            ]);

            await interaction.editReply({
              embeds: [shopEmbed],
              components: [new ActionRowBuilder().addComponents(shopSelect)],
              flags: MessageFlags.Ephemeral
            })
          }
          case false: {
            //Shop is not empty
            for (let [i, item] of shopItems.entries()) {
              //Add embed fields
              shopEmbed.addFields([
                {
                  name: `\u200b`,  // \u200b is a whitespace character
                  value: `\`\`\`╠ 📜 ${await t("add_item_button.modal_name")} ${item.data ? item.data.name : "N/A"}\n╠ 💵 ${await t("add_item_button.modal_price")} ${item.data ? item.data.price : "N/A"} Coins\n╠ 📖 ${await t("add_item_button.modal_description")} ${item.data ? item.data.description : "N/A"}\`\`\``,
                },
              ])

              //Add select menu options
              shopSelect.addOptions([
                {
                  label: `${await t("shop.item_label")} #${i}`,
                  description: `${item.data ? item.data.name : "N/A"}`,
                  value: `${i}`,
                },
              ])
            }

            await interaction.editReply({
              embeds: [shopEmbed],
              components: [new ActionRowBuilder().addComponents(shopSelect)],
              flags: MessageFlags.Ephemeral
            })
          }
        }
      }
    }
  }
}

