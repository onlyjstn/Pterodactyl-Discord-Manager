const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("./../classes/translationManager")
const { PanelManager } = require("../classes/panelManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { BaseInteraction, Client, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("account-manager")
    .setDescription("Create, manage or delete your account"),
  /**
   * 
   * Command for the user to manage his account
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
   * 
   */
  async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    let { user: { id: userId, tag }, user: iUser } = interaction, fetchedUser = await iUser.fetch(true), { accentColor } = fetchedUser, userData = await databaseInterface.getObject(userId)

    let selectRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("accountSelect")
          .setPlaceholder(`${await t("account_manager.placeholder")}`)
          .addOptions(
            {
              label: `🚪 ${await t("account_manager.create_label")}`,
              value: `createAccount`,
              description: `${await t("account_manager.create_text")}`,
              default: false,
            },
            {
              label: `🗑️ ${await t("account_manager.delete_label")}`,
              value: `deleteAccount`,
              description: `${await t("account_manager.delete_text")}`,
              default: false,
            },
            {
              label: `🔃 ${await t("account_manager.password_label")}`,
              value: `resetPassword`,
              description: `${await t("account_manager.password_text")}`,
              default: false,
            },
            {
              label: `🎀 ${await t("account_manager.booster_label")}`,
              value: `claimBoosterReward`,
              description: `${await t("account_manager.booster_text")}`,
              default: false,
            }
          )
      )

    let embed = new EmbedBuilder()
      .setTitle(`\`\`\`⚙️ ${await t("account_manager.main_label")} ⚙️\`\`\``)
      .setColor(accentColor ? accentColor : 0xe6b04d)
      .setDescription(`\`\`\`${await t("account_manager.main_text")}\n\`\`\`\n\`\`\`📨 ${await t("account_manager.main_mail")}\n➥  ${userData != null ? userData.e_mail : await t("account_manager.no_account")}\n\`\`\`\`\`\`🧑‍💼 ${await t("account_manager.main_username")}\n➥  ${userData != null ? userData.name : await t("account_manager.no_account")}\n\`\`\`\`\`\`💰 ${await t("account_manager.main_coins")}\n➥  ${userData != null ? userData.balance == undefined ? 0 : userData.balance : 0} Coins\n\`\`\``)

    //Reply to User
    await interaction.editReply({
      embeds: [embed],
      components: [selectRow],
      flags: MessageFlags.Ephemeral,
    });
  },
};
