const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder } = require("discord.js")
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const deletion_offset = process.env.DELETION_OFFSET;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-manager")
    .setDescription("Manage your servers"),
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
    await interaction.deferReply({ ephemeral: true })
    //Check if User has an Account
    let { user: { id: userId, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser, userData = await databaseInterface.getObject(userId);
    if (userData == null) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("errors.no_account_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true,
      });
      //Logging
      await logManager.logString(`${tag} tried to use /server_manager without an Account`)
      return;
    }

    //Get Servers - List of User
    let userServers = await panel.getAllServers(userData.e_mail)

    //Check if the User has 0 Servers
    if (userServers == null || userServers.length == 0) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
            .setDescription(`\`\`\`${await t("server_manager.no_servers_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
        ],
        ephemeral: true,
      });
      //Logging
      await logManager.logString(`${tag} tried to use /server_manager but has no Servers`)
      return;
    }


        let selectServerEmbed = new EmbedBuilder()
          .setTitle("```" + `✍️ ${await t("server_manager.main_label")} ✍️` + "```")
          .setDescription("```" + `${await t("server_manager.server_select_text")} ${userServers.length} ${await t("server_manager.server_select_text_two")}` + "```")
          .setColor(accentColor ? accentColor : 0xe6b04d)
          .setFooter({ text: "1" })

        let selectServerMenu = new StringSelectMenuBuilder().setCustomId("serverSelect")

        //Add Embed and Select Fields
        for (let i = 0; i < 25 && i < userServers.length; i++) {

          if(!userServers[i]) return

          let runtime = await panel.getServerRuntime(userServers[i].attributes.identifier)

          switch (runtime.status == false) {
            case true: {
              runtimeDate = `🕐 N/A`
              break;
            }
            case false: {
              switch (runtime.type) {
                case "suspension": {
                  runtimeDate = `🕐 <t:${Math.floor(new Date(runtime.data.date_running_out.date).setHours(0, 0, 0, 0) / 1000)}>`
                  break;
                }
                case "deletion": {
                  runtimeDate = `⛔ <t:${Math.floor(new Date(runtime.data.deletion_date.date).setHours(0, 0, 0, 0) / 1000)}>`;
                }
              }
            }
          }

          selectServerEmbed.addFields([
            {
              name: `🎮 ${await t("server_manager_pagination.server_select_label")} #${i}    ${runtimeDate}`,
              value: "```" + userServers[i].attributes.name.substring(0, 25) + "```",
              inline: false,
            }
          ])

          selectServerMenu.addOptions([
            {
              label: `🎮 ${await t("server_manager_pagination.server_select_label")} #${i}`,
              description: `${userServers[i].attributes.name}`,
              value: `${i}`,
            }
          ])
        }

        if(userServers.length > 25) {
          await interaction.editReply({
            embeds: [selectServerEmbed],
            components: [
              new ActionRowBuilder().addComponents(selectServerMenu),
              new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("nextServerPage").setLabel(`${await t("server_manager_pagination.next_page")}`).setStyle("Primary"))
            ],
            ephemeral: true
          })
          return
        }

        await interaction.editReply({
          embeds: [selectServerEmbed],
          components: [
            new ActionRowBuilder().addComponents(selectServerMenu),
          ],
          ephemeral: true
        })
  }
}

