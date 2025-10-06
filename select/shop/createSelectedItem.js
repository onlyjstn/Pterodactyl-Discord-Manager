const { PanelManager } = require("../../classes/panelManager")
const { TranslationManager } = require("./../../classes/translationManager")
const { BoosterManager } = require("./../../classes/boosterManager")
const { CacheManager } = require("./../../classes/cacheManager")
const { EconomyManager } = require("./../../classes/economyManager")
const { LogManager } = require("./../../classes/logManager")
const { DataBaseInterface } = require("./../../classes/dataBaseInterface")
const { UtilityCollection } = require("./../../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")

module.exports = {
  customId: "createSelectedItem",
  /**
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
    let { user: { id:userId, tag }, values:itemId, user } = interaction, shopItems = await databaseInterface.getObject("shop_items_servers"), userBalance = await economyManager.getUserBalance(userId), item = shopItems[itemId], { data: { price, name, egg_id, server_ram, server_swap, server_disk, server_cpu, server_databases, server_backups, runtime } } = item , userData = await databaseInterface.getObject(userId)
    let fetchedUser = await user.fetch(true), { accentColor } = fetchedUser, { e_mail } = userData
    await interaction.deferReply({ ephemeral: true })

    //Check if item is configured correctly
      //Get Nests
      let nestData = await panel.getNestData();
      //Get chosen Egg Data
      let chosenNestData = nestData.find(nest => nest.attributes.relationships.eggs.data.some(egg => egg.attributes.id == egg_id))

    console.table(chosenNestData)
    if(!chosenNestData) {
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

    //User does not have enough Coins
    if ((userBalance ? userBalance : 0) < price) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("shop_select.not_enough_coins.text")} ${price} ${await t("shop_select.not_enough_coins.text_two")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true
      });
      //Logging
      await logManager.logString(`${tag} tried to buy a Shop Item with insufficient coins: ${userBalance}. Item Name: ${name}`)
      return;
    }

    let server = await panel.createServer(e_mail, `${name} ${userId}`, egg_id, server_ram, server_swap, server_disk, 500, server_cpu, server_databases, server_backups), { status, data: { attributes: { uuid } } } = server
    //Error with Server Creation
    if (status != 201 && status != 200) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("shop_select.server_not_created_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true
      });
      //Logging
      await logManager.logString(`${tag}'s shop item / server creation caused an error.`)
      return
    }

    //Remove Coins from user
    await economyManager.removeCoins(userId, price)

    //Add Server to runtime list
    console.warn(runtime)
    if(runtime) {
    await panel.setServerRuntime(uuid, runtime, userId, price)
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`🛒 ${await t("shop_select.shop_main_label")} 🛒\`\`\``)
          .setDescription(`\`\`\`${await t("shop_select.server_created_text")}\`\`\``)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true
    });

    await logManager.logString(`${tag} bought a Shop Item with the Name: ${name} for ${price} Coins.`)
  }
}