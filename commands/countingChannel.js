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
    .setName("set-counting-channel")
    .setDescription("Sets the Channel the Counting-Game should be tracked in")
    .addChannelOption((channelOption) =>
        channelOption.setName("channel").setDescription("Channel the Game should be tracked in").setRequired(true)
    ),
    /**
     * Counting-Game Management Command
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
    //Reply to User
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    let { user: { id: userId, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    let channel = interaction.options.getChannel("channel")
    databaseInterface.setObject("countingChannel", channel)

            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`\`\`\`${await t("counting.counting_channel")}\`\`\``)
                  .setDescription(`${await t("counting.counting_channel_set")}: <#${channel.id}>`)
                  .setColor(accentColor ? accentColor : 0xe6b04d)
              ],
              flags: MessageFlags.Ephemeral
            });

    await logManager.logString("Channel for the Counting System has been set to " + channel.name + " with ID: " + channel.id + " by " + user.globalName + " with ID: " + user.id)
  },
};
