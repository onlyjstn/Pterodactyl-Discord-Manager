const { PanelManager } = require("../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, SelectMenuOptionBuilder } = require("discord.js")
const dotenv = require("dotenv");
dotenv.config({
    path: "./config.env",
  });


module.exports = {
    data: new SlashCommandBuilder()
        .setName("giftcode-manager")
        .setDescription("Create or delete Gift-Codes"),
    /**
    * Show user how many coins are in total conversion
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
        await interaction.deferReply({ ephemeral: true })
        let { user: { id: userId, tag }, user: user } = interaction, fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
        let userData = await databaseInterface.getObject(userId)

        let giftCodes = await databaseInterface.getObject("gift_codes_list")
        if(giftCodes == null) giftCodes = []

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
                ephemeral: true,
            });
            //Logging
            await logManager.logString(`${tag} tried to use /giftcode-manager without admin permissions`)
            return;
        }


        let giftCodesEmbed = new EmbedBuilder()
            .setTitle(`\`\`\`🎁 ${await t("giftcode_manager.main_label")} 🎁\`\`\``)
            .setDescription(`\`\`\`${await t("giftcode_manager.main_text")} ${giftCodes ? giftCodes.length : 0} ${await t("giftcode_manager.main_text_two")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)

        let giftCodesMenu = new StringSelectMenuBuilder().setCustomId("giftCodeSelect")

        giftCodesMenu.addOptions([
            {
                label: `➕ ${await t("giftcode_manageradd_item_label")}`,
                description: `${await t("giftcode_manageradd_item_text")}`,
                value: `addCode`
            }
        ])

        //Add Embed and Select Fields
        for (let i = 0; i < 24 && i < giftCodes.length; i++) {
            giftCodesEmbed.addFields([
                {
                    name: `🎁 #${i}: ${giftCodes[i].code}`,
                    value: `\`\`\`📋 Code: ${giftCodes[i].code}\n🪙 Value: ${giftCodes[i].value} Coins\`\`\``,
                    inline: false
                }
            ])

            giftCodesMenu.addOptions([
                {
                    label: `🎁 #${i}: ${giftCodes[i].code}`,
                    description: `${giftCodes[i].code}`,
                    value: `${i}`
                }
            ])
        }

        let row = new ActionRowBuilder().addComponents(giftCodesMenu)

        await interaction.editReply({
            embeds: [giftCodesEmbed],
            components: [row],
            ephemeral: true
        })
    }
}