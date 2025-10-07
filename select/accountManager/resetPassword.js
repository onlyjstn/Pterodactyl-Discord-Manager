const { PanelManager } = require("../../classes/panelManager")
const { TranslationManager } = require("./../../classes/translationManager")
const { BoosterManager } = require("./../../classes/boosterManager")
const { CacheManager } = require("./../../classes/cacheManager")
const { EconomyManager } = require("./../../classes/economyManager")
const { LogManager } = require("./../../classes/logManager")
const { DataBaseInterface } = require("./../../classes/dataBaseInterface")
const { UtilityCollection } = require("./../../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js")

module.exports = {
    customId: "resetPassword",
    /**
     * 
     * Account manager select menu options
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
        let { user: { id, tag }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser, userData = await databaseInterface.getObject(id)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!userData) {
            //Reply to User
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
                        .setDescription(`\`\`\`${await t("account_manager_modal.password_no_account_text")}\`\`\``)
                        .setColor(accentColor ? accentColor : 0xe6b04d)
                ],
                flags: MessageFlags.Ephemeral,
            });
            //Logging
            await logManager.logString(`${tag} tried to reset his account-password but failed due to him not having an account.`)
            return;
        }

        //Set new password
        let { e_mail } = userData
        let resetData = await panel.resetUserPassword(e_mail), { passkey: password } = resetData

        //Reply to User
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`\`\`\`🤵⠀${await t("account_manager_modal.password_label")} 🤵\`\`\``)
                    .setDescription(`\`\`\`${await t("account_manager_modal.password_text")} ${password}\`\`\``)
                    .setColor(accentColor ? accentColor : 0xe6b04d)
            ],
            flags: MessageFlags.Ephemeral,
        });
        //Logging
        await logManager.logString(`${tag} succesfully reset his password.`)
        return;
    }
}