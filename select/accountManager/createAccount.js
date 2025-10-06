const { PanelManager } = require("../../classes/panelManager")
const { TranslationManager } = require("./../../classes/translationManager")
const { BoosterManager } = require("./../../classes/boosterManager")
const { CacheManager } = require("./../../classes/cacheManager")
const { EconomyManager } = require("./../../classes/economyManager")
const { LogManager } = require("./../../classes/logManager")
const { DataBaseInterface } = require("./../../classes/dataBaseInterface")
const { UtilityCollection } = require("./../../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")
const { CanvasPreset } = require("../../classes/canvasPresets")

module.exports = {
    customId: "createAccount",
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
        let canvas = new CanvasPreset(user)

        const accountCreationModal = new ModalBuilder()
            .setCustomId("creationModal")
            .setTitle(`${await t("account_manager_modal.main_label")}`);
        // Add components to modal
        const user_e_mail = new TextInputBuilder()
            .setCustomId("usereMail")
            .setLabel(`${await t("account_manager_modal.email_label")}`)
            .setStyle(TextInputStyle.Short);

        const user_name = new TextInputBuilder()
            .setCustomId("userName")
            .setLabel(`${await t("account_manager_modal.name_label")}`)
            .setStyle(TextInputStyle.Short);

        //Add Actionrows to Modal
        accountCreationModal.addComponents([new ActionRowBuilder().addComponents(user_e_mail), new ActionRowBuilder().addComponents(user_name)]);
        //Database Check if User exists
        //Check if user already has an account
        if (userData) {
            let attachment = await canvas.errorCanvas(`⛔ ${await t("errors.error_label")} ⛔`, `${await t("account_manager_modal.already_has_account_text")}`)
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(accentColor ? accentColor : 0xe6b04d)
                        .setImage(`attachment://${attachment.name}`),
                ],
                ephemeral: true,
                files: [attachment],
            });
            //Logging
            await logManager.logString(`${tag} tried to create an account but already had one.`)
            return;
        }
        //show modal
        await interaction.showModal(accountCreationModal);

    }
}