const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { data } = require("../../commands/serverManager");


module.exports = {
  customId: "addShopItemDataConfirm",

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
    let { user: { id, accentColor, tag } } = interaction, cachedData = await cacheManager.getCachedData(id)
    await interaction.deferReply({ ephemeral: true });

    await cacheManager.clearCache(id)

    //No cached data
    if (cachedData == undefined) {
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

    let { server_cpu: cpu, server_ram: ram, server_disk: disk, server_swap: swap, server_backups: backups, egg_id } = cachedData
    //Check if item is configured correctly
    //Get Nests
    let nestData = await panel.getNestData();
    //Get chosen Egg Data
    let chosenNestData = nestData.find(nest => nest.attributes.relationships.eggs.data.some(egg => egg.attributes.id == egg_id))
    if (!chosenNestData || !Number.isFinite(parseInt(cpu)) || !Number.isFinite(parseInt(ram)) || !Number.isFinite(parseInt(disk)) || !Number.isFinite(parseInt(swap)) || !Number.isFinite(parseInt(backups)) || !Number.isFinite(parseInt(egg_id))) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("shop_select.configuration")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true
      });
      return;
    }


    await databaseInterface.addShopItem("server", cachedData)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`✍️ ${await t("add_item_modal_confirm.main_label")} ✍️\`\`\``)
          .setDescription(`\`\`\`${await t("add_item_modal_confirm.shop_item_created_text")}\`\`\``)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true
    });
    //Logging
    await logManager.logString(`${tag} succesfully added an item to the Shop: CPU: ${cpu}, RAM: ${ram}, DISK: ${disk}, SWAP: ${swap}, BACKUPS: ${backups}`)
  },
};
