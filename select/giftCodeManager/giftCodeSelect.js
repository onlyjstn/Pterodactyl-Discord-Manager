const { PanelManager } = require("../../classes/panelManager")
const { TranslationManager } = require("../../classes/translationManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { UtilityCollection } = require("../../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, MessageFlags } = require("discord.js")

module.exports = {
    customId: "giftCodeSelect",
    /**
     * Select-Menu for adding items to the shop
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
    async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, giftCodeManager) {
        let { user: { id, tag }, user, values } = interaction, giftCodes = await databaseInterface.getObject("gift_codes_list"), fetchedUser = await user.fetch(true), { accentColor } = fetchedUser


        //Add code item
        if (interaction.values == "addCode") {
            let selectOption = client.selectMenus.get("addCodeItem")
            await selectOption.execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, giftCodeManager)
            return
        }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })


        let giftCodesEmbed = new EmbedBuilder()
            .setTitle(`\`\`\`🎁 ${await t("giftcode_manager.main_label")} 🎁\`\`\``)
            .setDescription(`\`\`\`${await t("giftcode_manager.select_text")}\n📋 Code: ${giftCodes[interaction.values].code}\n🪙 Value: ${giftCodes[interaction.values].value}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
            .setFooter({
                text: giftCodes[interaction.values].code
            })

        await interaction.editReply({
            embeds: [giftCodesEmbed],
            components: [new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setCustomId("deleteCodeButton")
                    .setEmoji("🗑️")
                    .setLabel(`${await t("giftcode_manager.delete_code_label")}`)
                    .setStyle(ButtonStyle.Danger)
            ])],
            flags: MessageFlags.Ephemeral
        })
    }
}