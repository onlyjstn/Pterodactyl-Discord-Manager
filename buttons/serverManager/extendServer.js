const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const dotenv = require("dotenv")
dotenv.config({
  path: "./config.env",
});
let priceOffset = process.env.PRICE_OFFSET;

module.exports = {
  customId: "extendServer",

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
    await interaction.deferReply({ ephemeral: true });
    //Get Server ID
    let { message: { embeds }, user: { id, tag, accentColor } } = interaction, { data: { fields, title } } = embeds[0], { value } = fields[3], serverUuid = (value.substring(6)).substring(0, (value.substring(6).length - 3)), serverIndex = title.slice(title.lastIndexOf("#") + 1)
    let userData = await databaseInterface.getObject(id), userServers = await panel.getAllServers(userData.e_mail), server = userServers.find(server => server.attributes.uuid == serverUuid), installStatus = await panel.getInstallStatus(server ? server.attributes.identifier : undefined)


    //Check if Server is available or is still being installed or deleted
    //Check if Server still exists
    if (typeof (server) == undefined || !server) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("server_manager_events.server_not_found_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true
      })
      return;
    }

    //Destructure server
    let { attributes: { id: serverId, uuid, identifier } } = server
    let runtimeList = await panel.getRuntimeList(), deletionList = await panel.getDeletionList()
    console.log(runtimeList)
    let runtimeData = runtimeList.find(server => server.uuid == uuid), deletionData = deletionList ? deletionList.find(server => server.uuid == uuid) : null
    let { runtime, price } = runtimeData ? runtimeData : deletionData
    //Check if user has enough coins
    if(userData.balance < (price * priceOffset)) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
          .setDescription(`\`\`\`${await t("shop_select.not_enough_coins.text")} ${price * priceOffset} ${await t("shop_select.not_enough_coins.text_two")}\`\`\``)
          .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true
      })
      return
    }
    //Extend Runtime by Standard Amount of set Runtime with price increase / decrease set in config
    if(deletionData && !runtimeData) await panel.unSuspendServer(serverId)
    await economyManager.removeCoins(id, (price * priceOffset))
    await panel.extendRuntime(identifier, runtime)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(`\`\`\`✍️ ${await t("server_manager_events.main_label")} ✍️\`\`\``)
        .setDescription(`\`\`\`${await t("server_manager_events.runtime_text")}\n💰 ${await t("shop.price_label")}: ${price * priceOffset}\n🔃 ${await t("server_manager_events.runtime_text_two")}: ${runtime} ${await t("server_manager_events.runtime_text_three")}\`\`\``)
        .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true
    });
  },
};
