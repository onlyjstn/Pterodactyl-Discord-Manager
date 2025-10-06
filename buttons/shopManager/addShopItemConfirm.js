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
  customId: "addShopItemConfirm",

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
    //Check if User clicked an already clicked button
    let cachedData = await cacheManager.getCachedData(id)

    //No cached data
    if (cachedData == undefined) {
      await interaction.deferReply({ephemeral: true});
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("add_item_modal_confirm.no_saved_data_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true,
      });
      return;
    }


    //Server Item Creation Modal
    let addServerModal = new ModalBuilder({})
      .setCustomId("addServerItemModal")
      .setTitle("Add Shop Item");

    const itemEgg = new TextInputBuilder()
      .setCustomId("serverEggId")
      .setLabel(`${await t("add_item_modal_confirm.data_modal_egg_text")}`)
      .setPlaceholder(`${await t("add_item_modal_confirm.data_modal_egg_ph_text")}`)
      .setStyle(TextInputStyle.Short);

    const itemDatabases = new TextInputBuilder()
      .setCustomId("serverDatabases")
      .setLabel(`${await t("add_item_modal_confirm.data_modal_db_text")}`)
      .setPlaceholder(`${await t("add_item_modal_confirm.data_modal_disk_ph_text")}`)
      .setStyle(TextInputStyle.Short);

    addServerModal.addComponents([
      new ActionRowBuilder().addComponents([itemEgg]),
      new ActionRowBuilder().addComponents([itemDatabases])
    ]);
    //Show Modal
    await interaction.showModal(addServerModal);
    return;
  },
};
