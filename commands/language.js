const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder } = require("discord.js")
// Latenz oder Umlaufzeit
module.exports = {
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription("Choose your desired bot language"),
  /**
   * Lets users change their language
   * 
   * @param {BaseInteraction} interaction 
   * @param {Client} client 
   * @param {PanelManager} panel 
   * @param {BoosterManager} boosterManager 
   * @param {CacheManager} cacheManager 
   * @param {EconomyManager} economyManager 
   * @param {LogManager} logManager 
   * @param {TranslationManager} t
   * @returns 
   */
  async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t) {
    await interaction.deferReply({ ephemeral: true })
    let { user: { id: userId, tag }, user: user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    //Reply to User and send Buttons
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(`\`\`\`🌍 ${await t("language.language_label")} 🌍\`\`\``)
        .setDescription(`\`\`\`${await t("language.language_text")}\`\`\``)
        .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setStyle("Success")
            .setLabel("🇩🇪 German")
            .setDisabled(false)
            .setCustomId("de"),

            new ButtonBuilder()
            .setStyle("Success")
            .setLabel("🇬🇧 English")
            .setDisabled(false)
            .setCustomId("en"),

            new ButtonBuilder()
            .setStyle("Success")
            .setLabel("🇫🇷 French")
            .setDisabled(false)
            .setCustomId("fr"),
          )
      ],
      ephemeral: true
    });
  },
};
