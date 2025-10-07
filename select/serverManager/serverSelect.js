const { PanelManager } = require("../../classes/panelManager")
const { TranslationManager } = require("./../../classes/translationManager")
const { BoosterManager } = require("./../../classes/boosterManager")
const { CacheManager } = require("./../../classes/cacheManager")
const { EconomyManager } = require("./../../classes/economyManager")
const { LogManager } = require("./../../classes/logManager")
const { DataBaseInterface } = require("./../../classes/dataBaseInterface")
const { UtilityCollection } = require("./../../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js")
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
let deletion_offset = process.env.DELETION_OFFSET, price_offset = process.env.PRICE_OFFSET


module.exports = {
  customId: "serverSelect",
  /**
   * Server-Manager shows information about the selected server
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
    let { values:serverIndex , user: { tag, id }, user } = interaction, userData = await databaseInterface.getObject(id), { e_mail } = userData, userServers = await panel.getAllServers(e_mail), selectedServer = userServers[serverIndex], fetchedUser = await user.fetch(true), { accentColor } = fetchedUser

    //Check if Server still exists
    if(selectedServer == undefined || !selectedServer) {
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

    let { attributes: { identifier, suspended } } = selectedServer

    //Collect data about the server
    let serverLiveUsage = await panel.liveServerRessourceUsage(identifier)
    //Server still installing
    if(serverLiveUsage == undefined && suspended == false) {
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
    let { attributes: { resources: { memory_bytes, cpu_absolute, uptime } } } = serverLiveUsage ? serverLiveUsage : { attributes: { resources: { memory_bytes: 0, cpu_absolute: 0, uptime: 0 } } }
    let liveRam = !serverLiveUsage ? "N/A" : Math.ceil(memory_bytes * 0.00000095367432), liveCpu = !serverLiveUsage ? "N/A" : Math.ceil(cpu_absolute)
    let serverUptime = !serverLiveUsage ? "N/A" : Math.ceil(uptime / 60 / 60), serverSuspended = suspended ? await t("server_manager_events.server_suspended_text") : await t("server_manager_events.server_suspended_text_no")
    let serverRuntime = await panel.getServerRuntime(identifier), suspensionData, deletionData
    
    //Get server deletion and suspension dates
    switch(serverRuntime.type) {
      case "suspension": {
        suspensionData = `<t:${Math.floor(new Date(serverRuntime.data.date_running_out.date).setHours(0,0,0,0) / 1000)}>\n\n**💰 ${await t("server_manager_events.price_extension_label")}**\n\`\`\`${serverRuntime.data.price * price_offset} Coins\`\`\`\n**🔃 ${await t("server_manager_events.runtime_extension_amount_label")}**\n\`\`\`${serverRuntime.data.runtime} ${await t("server_manager_events.runtime_text_three")}\`\`\``;
        deletionData = `<t:${Math.floor(new Date(new Date(serverRuntime.data.date_running_out.date).getTime() + deletion_offset * 86400000).setHours(0,0,0,0) / 1000)}>`
        break;
      }
      case "deletion": {
        suspensionData = "N/A"
        deletionData = `<t:${Math.floor(new Date(serverRuntime.data.deletion_date.date).setHours(0,0,0,0) / 1000)}>\n\n**💰 ${await t("server_manager_events.price_extension_label")}**\n\`\`\`${serverRuntime.data.price * price_offset} Coins\`\`\`\n**🔃 ${await t("server_manager_events.runtime_extension_amount_label")}**\n\`\`\`${serverRuntime.data.runtime} ${await t("server_manager_events.runtime_text_three")}\`\`\``;
      }
    }


    //Server Embed
    let serverInfoEmbed = new EmbedBuilder()
    .setTitle(`${await t("server_manager_pagination.server_select_label")} #${serverIndex}`)
    .setColor(accentColor ? accentColor : 0xe6b04d)
    .setFooter({text: `${await t("serverinfo.created")} ${selectedServer.attributes.created_at}`})
    .addFields([{  name: `:clock1: ${await t("serverinfo.suspension_label")}`,  value: "\n" + (suspensionData ? suspensionData : "N/A") + "",  inline: false,},{  name: `:no_entry: ${await t("serverinfo.deletion_label")}`,  value: "\n" + (deletionData ? deletionData : "N/A") + "",  inline: false,},{  name: `:computer: ${await t("serverinfo.name")}`,  value: `\`\`\`js\n${selectedServer.attributes.name}\`\`\``,  inline: true,},{  name: `:1234: ${await t("serverinfo.uuid")}`,  value: `\`\`\`js\n${selectedServer.attributes.uuid}\`\`\``,  inline: true,},{  name: `:id: ${await t("serverinfo.id")}`,  value: `\`\`\`js\n${selectedServer.attributes.id}\`\`\``,  inline: true,},{  name: `:chart_with_upwards_trend: ${await t("serverinfo.ram")}`,  value: `\`\`\`js\n${liveRam} / ${selectedServer.attributes.limits.memory} MB\`\`\``,  inline: true,},{  name: `:gear: ${await t("serverinfo.cpu")}`,  value:    `\`\`\`js\n${liveCpu} / ${selectedServer.attributes.limits.cpu} %\`\`\``,  inline: true,},{  name: `:chart_with_upwards_trend: ${await t("serverinfo.ram_usage")}`,  value: `\`\`\`js\n${liveRam} MB\`\`\``,  inline: true,},{  name: `:gear: ${await t("serverinfo.cpu_usage")}`,  value: `\`\`\`js\n${liveCpu} %\`\`\``,  inline: true,},{  name: `:floppy_disk: ${await t("serverinfo.disk")}`,  value: `\`\`\`js\n${selectedServer.attributes.limits.disk} MB\`\`\``,  inline: true,},{  name: `:minidisc: ${await t("serverinfo.swap")}`,  value: `\`\`\`js\n${selectedServer.attributes.limits.swap} MB\`\`\``,  inline: true,},{  name: `:x: ${await t("serverinfo.suspended")}`,  value: `\`\`\`js\n${serverSuspended}\`\`\``,  inline: true,},{  name: `:clock2: ${await t("serverinfo.node")}`,  value: `\`\`\`js\n${selectedServer.attributes.node}\`\`\``,  inline: true,},{  name: `:satellite: ${await t("serverinfo.uptime")}`,  value: `\`\`\`js\n${serverUptime} Minutes\`\`\``,  inline: true,},])

    console.log(serverRuntime)

    let serverCommandButtonsRowOne = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
      .setStyle("Success")
      .setCustomId("startServer")
      .setLabel(`${await t("server_manager_select.button_start_label")}`),

      new ButtonBuilder()
      .setStyle("Danger")
      .setCustomId("stopServer")
      .setLabel(`${await t("server_manager_select.button_stop_label")}`),

      new ButtonBuilder()
      .setStyle("Primary")
      .setCustomId("reinstallServer")
      .setLabel(`${await t("server_manager_select.button_reinstall_label")}`),

      new ButtonBuilder()
      .setStyle("Primary")
      .setCustomId("renameServer")
      .setLabel(`${await t("server_manager_select.button_rename_label")}`),

      new ButtonBuilder()
      .setStyle("Primary")
      .setCustomId("serverInfo")
      .setLabel(`${await t("server_manager_select.button_info_label")}`),
    )

    let serverCommandButtonsRowTwo = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
      .setStyle("Danger")
      .setCustomId("deleteServer")
      .setLabel(`${await t("server_manager_select.button_delete_label")}`),

      new ButtonBuilder()
      .setStyle("Success")
      .setCustomId("extendServer")
      .setLabel(`${await t("server_manager_select.button_extend_runtime")}`)
      .setDisabled(serverRuntime.status == false ? true : false)
    )


    await interaction.editReply({
      embeds: [serverInfoEmbed],
      components: [serverCommandButtonsRowOne, serverCommandButtonsRowTwo],
      flags: MessageFlags.Ephemeral
    })

    await logManager.logString(`${tag} requested information of his Server with the identifier ${selectedServer.attributes.uuid}`)
  },
};
