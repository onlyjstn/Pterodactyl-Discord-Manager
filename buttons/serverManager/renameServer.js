const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js")


module.exports = {
  customId: "renameServer",

  /**
   * Rename server
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
    //Get Server ID
    let { message: { embeds }, user: { id, tag, accentColor } } = interaction, { data: { fields, title } } = embeds[0], { value } = fields[3], serverUuid = (value.substring(6)).substring(0, (value.substring(6).length - 3)), serverIndex = title.slice(title.lastIndexOf("#") + 1)
    let userData = await databaseInterface.getObject(id), userServers = await panel.getAllServers(userData.e_mail), server = userServers.find(server => server.attributes.uuid == serverUuid), installStatus = await panel.getInstallStatus(server? server.attributes.identifier : undefined)

    //Check if Server is available or is still being installed or deleted
    //Check if Server still exists
    if (typeof (server) == undefined || !server || installStatus == false) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("server_manager_events.server_not_found_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        flags: MessageFlags.Ephemeral
      })
      return;
    }

    //Show Modal to rename Server
    let renameModal = new ModalBuilder()
      .setCustomId("renameModal")
      .setTitle(`Rename: ${serverUuid}`);
    const user_rename = new TextInputBuilder()
      .setCustomId("serverRenameText")
      .setLabel(`New Server Name:`)
      .setStyle(TextInputStyle.Short);
    const renameRow = new ActionRowBuilder().addComponents([user_rename]);
    renameModal.addComponents([renameRow]);
    await interaction.showModal(renameModal);
    return;
  },
};
