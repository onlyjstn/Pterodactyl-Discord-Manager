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
    customId: "deleteAccount",
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
        let { user: { id, tag }, user, channel } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser, userData = await databaseInterface.getObject(id)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        //User has no Account, that could be deleted
        if (!userData) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
                        .setDescription(`\`\`\`${await t("account_manager_modal.deletion_no_account_text")}\`\`\``)
                        .setColor(accentColor ? accentColor : 0xe6b04d)
                ],
                flags: MessageFlags.Ephemeral,
            });
            //Logging
            await logManager.logString(`${tag} tried to delete his account but failed due to him not having an account.`)
            return;
        }

        //Prompt User to Confirm Deletion
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`\`\`\`❗ ${await t("account_manager.deletion_label")} ❗\`\`\``)
                    .setDescription(`\`\`\`${await t("account_manager.deletion_text")}\`\`\``)
                    .setColor(accentColor ? accentColor : 0xe6b04d)
            ],
                flags: MessageFlags.Ephemeral,
        });
        //Await User Confirmation and collect Message
        const filter = (m) => m.author.id === id;
        const collector = channel.createMessageCollector({
            filter,
            time: 15000,
            max: 1,
        });

        //Collect Message and read content
        collector.on("collect", async (collected) => {
            let { content } = collected, { e_mail } = userData
            try {
                await collected.delete();
            } catch (e) { console.log("Could not delete message") }
            //Check if User Confirmed deletion
            if (content !== "delete") {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
                            .setDescription(`\`\`\`${await t("account_manager.deletion_fail_text")}\`\`\``)
                            .setColor(accentColor ? accentColor : 0xe6b04d)
                    ],
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            //Delete user data
            await panel.deleteAllServers(e_mail)
            await databaseInterface.deleteUser(id)
            await panel.removeUser(e_mail)

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`\`\`\`🤵⠀${await t("account_manager_modal.deletion_success_label")} 🤵\`\`\``)
                        .setDescription(`\`\`\`${await t("account_manager_modal.deletion_success_text")}\`\`\``)
                        .setColor(accentColor ? accentColor : 0xe6b04d)
                ],
                flags: MessageFlags.Ephemeral,
            });
            //Logging
            await logManager.logString(`${tag} deleted his account.`);
            return;
        });
    }
}