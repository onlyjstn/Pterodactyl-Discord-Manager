const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, MessageFlags } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minigames")
    .setDescription("Play with your luck! Earn coins!"),
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
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    let { user: { id: userId, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser, userData = await databaseInterface.getObject(userId)
    //Check if User has an Account
    if (userData == null) {
      await interaction.editReply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.no_account_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("minigames.no_account_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        flags: MessageFlags.Ephemeral,
      });
      //Logging
      await logManager.logString(`${tag} tried to use /minigames without an Account`)
      return;
    }


    //Reply to User
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`⚙️ ${await t("minigames.main_label")} ⚙️\`\`\``)
          .setDescription(`\`\`\`${await t("minigames.main_text")}\`\`\``)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
  components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setStyle("Primary")
              .setLabel(await t("minigames.zahlen_label"))
              .setCustomId("zahlenRaten"),

            new ButtonBuilder()
              .setStyle("Primary")
              .setLabel(await t("minigames.blackjack_label"))
              .setCustomId("blackjack"),

            new ButtonBuilder()
              .setStyle("Primary")
              .setLabel(await t("minigames_events.difficulty_label"))
              .setCustomId("trivia"),
          )
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
