const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const continueButton = require("./../buttons/runtimeOverride/continue")
const cancelButton = require("./../buttons/runtimeOverride/cancel")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require("discord.js")
const cancel = require("./../buttons/runtimeOverride/cancel")

// Redeem Command
module.exports = {
    data: new SlashCommandBuilder()
        .setName("override-runtime")
        .setDescription("Manually set a server runtime for a user-owned server. Ressource-Intensive! [ADMIN]")
        .addStringOption((option) =>
            option.setRequired(true).setName("uuid").setDescription("Server-UUID")
        )
        .addIntegerOption((option) =>
            option.setRequired(true).setName("runtime").setDescription("Server-Runtime")
        )
        .addNumberOption((option) =>
            option.setRequired(true).setName("price").setDescription("Original-Server-Price")
        ),
    /**
     * Redeem Command
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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        let { user: { id: userId, tag }, user: user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
        let userData = await databaseInterface.getObject(userId)
        let uuid = interaction.options.getString("uuid"), runtime = interaction.options.getInteger("runtime"), price = interaction.options.getNumber("price")

        //Check if User is an Admin
        if (!process.env.ADMIN_LIST.includes(userId)) {
            //Reply that the User is no Admin
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`\`\`\`⛔ ${await t("errors.no_admin_label")} ⛔\`\`\``)
                        .setDescription(`\`\`\`${await t("errors.no_admin_text")}\`\`\``)
                        .setColor(accentColor ? accentColor : 0xe6b04d)
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        //Check if selected UUID is owned by an actual User in the database.
        let serverList = await panel.getAccumulatedUserServers()

        //Server is not owned by User ( has been created manually on the Panel )
        if (!serverList.includes(uuid)) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
                        .setDescription(`\`\`\`${await t("override_runtime.error")}\`\`\``)
                        .setColor(accentColor ? accentColor : 0xe6b04d)
                ],
                flags: MessageFlags.Ephemeral
            })
            return
        }


        //Check if Server already has a runtime applied
        //Get Server Identifier
        let serverIdentifier = await panel.getServerIdentifier(uuid)
        let runtimeData = await panel.getServerRuntime(serverIdentifier)

        //Server already has a Runtime applied to it. Ask User if he wants to override
        if (runtimeData.status == true) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`\`\`\` ⚠️ ${await t("override_runtime.has_runtime_label")} ⚠️\`\`\``)
                        .setDescription(`\`\`\`${await t("override_runtimehas_runtime_text")}\`\`\``)
                        .setColor(accentColor ? accentColor : 0xe6b04d)
                ],
                components: [new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setEmoji("✅")
                        .setCustomId("overrideTrue")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setEmoji("⛔")
                        .setCustomId("overrideFalse")
                        .setStyle(ButtonStyle.Danger)
                ])],
                flags: MessageFlags.Ephemeral
            })

            const answerFilter = i => {
                return i.user.id === userId
            }

            const answerCollector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000, max: 1, filter: answerFilter });

            answerCollector.on('collect', async answerButton => {
                await interaction.editReply({
                    components: [new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                            .setEmoji("✅")
                            .setCustomId("overrideTrue")
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setEmoji("⛔")
                            .setCustomId("overrideFalse")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    ])]
                })
                if (answerButton.customId == "overrideFalse") {
                    await cancelButton.execute(answerButton, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t)
                    return
                }

                await continueButton.execute(answerButton, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, uuid, serverIdentifier, runtime, price)
            })

            return
        }


        //Server has no Runtime --> Set Runtime
        //Get ServerUserId
        let serverUserId = await panel.getUserIDfromUUID(uuid) 

        await panel.setServerRuntime(uuid, runtime, serverUserId, price)

        await logManager.logString(`Server Runtime has been overwritten for UUID ${uuid}, Runtime ${runtime}, Price ${price} for User ${serverUserId} by ${userId}`)

            await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`\`\`\`✅ ${await t("override_runtime.override_label")} ✅\`\`\``)
                    .setDescription(`\`\`\`${await t("override_runtime.override_text")}\`\`\``)
                    .setColor(accentColor ? accentColor : 0xe6b04d)
            ],
            flags: MessageFlags.Ephemeral
        })
    }
}