const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, MessageFlags } = require("discord.js")


module.exports = {
  customId: "serverInfo",

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
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    //Get Server ID
    let { message: { embeds }, user: { id, tag, accentColor } } = interaction, { data: { fields, title } } = embeds[0], { value } = fields[3], serverUuid = (value.substring(6)).substring(0, (value.substring(6).length - 3)), serverIndex = title.slice(title.lastIndexOf("#") + 1)
    let userData = await databaseInterface.getObject(id), userServers = await panel.getAllServers(userData.e_mail), server = userServers.find(server => server.attributes.uuid == serverUuid), installStatus = await panel.getInstallStatus(server ? server.attributes.identifier : undefined)

    //Check if Server is available or is still being installed or deleted
    //Check if Server still exists
    if (typeof (server) == undefined || !server || installStatus == false) {
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

    //Destructure server
    let { attributes: { id: serverId, identifier, name, user, uuid, node, allocation, egg, created_at, updated_at, limits: { memory, cpu, disk, swap, io }, container: { image, startup_command, environment: { P_SERVER_LOCATION } } } } = server


    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`✍️ ${await t("server_manager_events.main_label")} ✍️\`\`\``)
          .setDescription(`\`\`\`${await t("server_manager_events.additional_info_text")}\`\`\``)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
      ephemeral: true
    });


    //Get Server Information
    //Get Live Resource Usage and destructure
    let serverLiveUsage = await panel.liveServerRessourceUsage(identifier)
    let { attributes: { resources: { uptime, memory_bytes, cpu_absolute }, suspended } } = serverLiveUsage
    let liveRam = !serverLiveUsage ? "N/A" : Math.ceil(memory_bytes * 0.00000095367432), liveCpu = !serverLiveUsage ? "N/A" : Math.ceil(cpu_absolute)
    let serverUptime = !serverLiveUsage ? "N/A" : Math.ceil(uptime / 60 / 60), serverSuspended = suspended ? await t("server_manager_events.server_suspended_text") : await t("server_manager_events.server_suspended_text_no")

    //Save Information
    let serverEmbed = new EmbedBuilder()
      .setTitle(`Server #${serverIndex}`)
      .setColor(0x00ffff)
      .addFields([{  name: `:computer: ${await t("serverinfo.name")}`,  value: `\`\`\`js\n${name}\`\`\``,  inline: true,},{  name: `:1234: ${await t("serverinfo.uuid")}`,  value: `\`\`\`js\n${uuid}\`\`\``,  inline: true,},{  name: `:id: ${await t("serverinfo.id")}`,  value: `\`\`\`js\n${serverId}\`\`\``,  inline: true,},{  name: `:chart_with_upwards_trend: ${await t("serverinfo.ram")}`,  value: `\`\`\`js\n${liveRam} / ${memory} %\`\`\``,  inline: true,},{  name: `:gear: ${await t("serverinfo.cpu")}`,  value: `\`\`\`js\n${liveCpu} / ${cpu} %\`\`\``,  inline: true,},{  name: `:chart_with_upwards_trend: ${await t("serverinfo.ram_usage")}`,  value: `\`\`\`js\n${liveRam} MB\`\`\``,  inline: true,},{  name: `:gear: ${await t("serverinfo.cpu_usage")}`,  value: `\`\`\`js\n${liveCpu} %\`\`\``,  inline: true,},{  name: `:floppy_disk: ${await t("serverinfo.disk")}`,  value: `\`\`\`js\n${disk} MB\`\`\``,  inline: true,},{  name: `:minidisc: ${await t("serverinfo.swap")}`,  value: `\`\`\`js\n${swap} MB\`\`\``,  inline: true,},{  name: `:nut_and_bolt: ${await t("serverinfo.io")}`,  value: `\`\`\`js\n${io}\`\`\``,  inline: true,},{  name: `:x: ${await t("serverinfo.suspended")}`,  value: `\`\`\`js\n${serverSuspended}\`\`\``,  inline: true,},{  name: `:clock2: ${await t("serverinfo.node")}`,  value: `\`\`\`js\n${node}\`\`\``,  inline: true,},{  name: `:satellite: ${await t("serverinfo.uptime")}`,  value: `\`\`\`js\n${serverUptime} Minutes\`\`\``,  inline: true,},{  name: `:calendar: ${await t("serverinfo.created")}`,  value: `\`\`\`js\n${created_at}\`\`\``,  inline: true,},{  name: `:calendar: ${await t("serverinfo.updated")}`,  value: `\`\`\`js\n${updated_at}\`\`\``,  inline: true,},{  name: `:id: ${await t("serverinfo.allo_id")}`,  value: `\`\`\`js\n${allocation}\`\`\``,  inline: true,},{  name: `:id: ${await t("serverinfo.egg")}`,  value: `\`\`\`js\n${egg}\`\`\``,  inline: true,},{  name: `:id: ${await t("serverinfo.user")}`,  value: `\`\`\`js\n${user}\`\`\``,  inline: true,},{  name: `:bar_chart: ${await t("serverinfo.image")}`,  value: `\`\`\`js\n${image}\`\`\``,  inline: true,},{  name: `:pick: ${await t("serverinfo.startup")}`,  value:  `\`\`\`js\n${startup_command}\`\`\``,  inline: false,},{  name: `:airplane_arriving: ${await t("serverinfo.location")}`,  value:  `\`\`\`js\n${P_SERVER_LOCATION}\`\`\``,  inline: true,},
      ])

    //Send Embed
    await interaction.editReply({
      embeds: [serverEmbed],
      flags: MessageFlags.Ephemeral
    });
    //Logging
    await logManager.logString(`${tag} requested additional information of his Server with the identifier ${uuid}`)
    return;
  },
};
