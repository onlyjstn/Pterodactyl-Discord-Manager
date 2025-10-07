const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, escapeInlineCode, ComponentType, MessageFlags } = require("discord.js")
const { UtilityCollection } = require("../../classes/utilityCollection");


module.exports = {
    customId: "deleteCodeButton",

    /**
     * Trivia minigame
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
    async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, giftCodeManager) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral }), { user: { id: userId, tag }, user: iUser, channel } = interaction, fetchedUser = await iUser.fetch(true), { accentColor } = fetchedUser

        let deleteCode = interaction.message.embeds[0].data.footer.text

        let deleteCodeValue = await giftCodeManager.deleteGiftCode(deleteCode)

        if(deleteCodeValue == false) {
            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setTitle(`\`\`\`❌ ${await t("errors.error_label")} ❌\`\`\``)
                    .setDescription(`\`\`\`${await t("giftcode_manager.code_not_found")}\`\`\``)
                    .setColor(accentColor ? accentColor : 0xe6b04d)],
                flags: MessageFlags.Ephemeral
            })
            return
        }

        interaction.editReply({
            embeds: [new EmbedBuilder()
                .setTitle(`\`\`\`🗑️ ${await t("giftcode_manager.main_label")} 🗑️\`\`\``)
                .setDescription(`\`\`\`${await t("giftcode_manager.deleted_text")}\`\`\``)
                .setColor(accentColor ? accentColor : 0xe6b04d)],
            flags: MessageFlags.Ephemeral
        })
    }
}