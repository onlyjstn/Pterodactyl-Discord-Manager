const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-coins")
    .setDescription("Admin-Command")
    .addUserOption((option) =>
      option.setName("user").setDescription("User").setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("amount").setDescription("Amount").setRequired(true)
    ),
  /**
   * Admin command for adding coins to a user
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
    let { user: { id: userId, tag }, user: iUser } = interaction, fetchedUser = await iUser.fetch(true), { accentColor } = fetchedUser
    //Get User to add Coins to
    let user = interaction.options.getUser("user"), amount = interaction.options.getNumber("amount"), receiverData = await databaseInterface.getObject(user.id)
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
          ephemeral: true,
        });
        //Logging
        await logManager.logString(`${tag} tried to add ${amount} Coins to User ${user.tag} without admin permissions`)
        break;
      }
      case true: {
        //Check if Receiver has an Account
        switch (receiverData == null) {
          case true: {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`\`\`\`⛔ ${await t("coins.no_account_send_label")} ⛔\`\`\``)
                  .setDescription(`\`\`\`${await t("coins.no_account_send_text")}\`\`\``)
                  .setColor(accentColor ? accentColor : 0xe6b04d)
              ],
              ephemeral: true
            });
            await logManager.logString(`${tag} tried to add Coins to a User who does not have an Account`)
            break;
          }
          case false: {
            //Add Coins to Receiver
            await economyManager.addCoins(user.id, amount)
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`\`\`\`🪙⠀${await t("coins.coin_label")} 🪙\`\`\``)
                  .setDescription(`\`\`\`${amount} ${await t("coins.admin_add_coins_text")} \ ${user.tag} \ ${await t("coins.admin_add_coins_text_two")}\`\`\``)
                  .setColor(accentColor ? accentColor : 0xe6b04d)
              ],
              ephemeral: true
            });
            //Logging
            await logManager.logString(`${tag} added ${amount} Coins to the User ${user.tag}`)
            break;
          }
        }
      }
    }
  }
};
