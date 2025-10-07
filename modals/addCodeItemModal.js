const { PanelManager } = require("./../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { GiftCodeManager } = require("./../classes/giftCodeManager")
const { BaseInteraction, Client, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuOptionBuilder, ComponentType, SelectMenuComponent, SelectMenuInteraction, MessageFlags } = require("discord.js")

module.exports = {
    customId: "addCodeItemModal",
    /**
     * Create a shop item
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
     * @param {GiftCodeManager} giftCodeManager
     * @returns
     */
    async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, giftCodeManager) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        let { fields, user: { tag, id }, user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
        let itemCode = fields.getTextInputValue("itemCode"), itemValue = fields.getTextInputValue("itemValue")

        //Check if Code should be Single use
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`\`\`\`❓ ${await t("giftcode_manager.single_use_label")} ❓\`\`\``)
                    .setDescription(`\`\`\`${await t("giftcode_manager.single_use_text")}\`\`\``)
                    .setColor(accentColor ? accentColor : 0xe6b04d)
            ],
            flags: MessageFlags.Ephemeral,
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("singleUseCodeSelect")
                        .addOptions(
                            {
                                label: 'Yes',
                                description: 'Single',
                                value: 'true',
                                emoji: "✅",
                            },
                            {
                                label: 'No',
                                description: 'Multi',
                                value: 'false',
                                emoji: "❌"
                            }
                        )
                )
            ]
        })

        let filter = i => {
            let { user: { id: userId } } = i
            return userId === id
        }

        let collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 15000, max: 1, filter });

        let codeCreatedEmbed = new EmbedBuilder()
            .setTitle(`\`\`\`✅ ${await t("giftcode_manager.created_label")} ✅\`\`\``)
            .setDescription(`\`\`\`${await t("giftcode_manager.created_text")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)

        collector.on("collect", async i => {
                let singleUser = i.values[0]
                //Add Code
                await giftCodeManager.createGiftCode(itemCode, itemValue, singleUser)

                await logManager.logString(`Giftcode: ${itemCode} with Value of: ${itemValue} and Type of ${singleUser} has been created by ${user.tag}`)

                await i.deferReply({ flags: MessageFlags.Ephemeral })
                await i.editReply({
                    embeds: [codeCreatedEmbed],
                    flags: MessageFlags.Ephemeral,
                    components: []
                })
        })
    }
}