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
  customId: "addServerItemModal",
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
    let { fields, user: { tag, id }, user } = interaction, itemEggId = fields.getTextInputValue("serverEggId"), itemDatabases = fields.getTextInputValue("serverDatabases"), fetchedUser = await user.fetch(true), { accentColor } = fetchedUser

    //Get Data from cache
    let cachedData = await cacheManager.getCachedData(id), { name, price, description, runtime } = cachedData

    let data = {
      name: name,
      price: price,
      description: description,
      runtime: runtime,
      egg_id: itemEggId,
      server_databases: itemDatabases,
    };

    //Write to Cache
    await cacheManager.cacheData(id, data)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`╔ ✅ ${await t("add_item_modal.confirm_label")}\`\`\``)
          .setDescription(`╠ **Egg-ID:** ${itemEggId}\n╠ **Databases:** ${itemDatabases}`)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
  flags: MessageFlags.Ephemeral,
      //Confirm Button
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle("Success")
            .setCustomId("addServerItemConfirm")
            .setLabel(`${await t("add_item_modal.button_confirm_text")}`),


          new ButtonBuilder()
            .setStyle("Danger")
            .setCustomId("addShopItemCancel")
            .setLabel(`${await t("add_item_modal.button_cancel_text")}`)
        )
      ],
    });
  },
};
