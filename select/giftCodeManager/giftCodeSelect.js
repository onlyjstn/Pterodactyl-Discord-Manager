const { PanelManager } = require("../../classes/panelManager")
const { TranslationManager } = require("../../classes/translationManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { UtilityCollection } = require("../../classes/utilityCollection")
const { EmojiManager } = require("../../classes/emojiManager")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, MessageFlags } = require("discord.js")
const dotenv = require("dotenv");
dotenv.config({
    path: "./config.env",
});

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
     * @param {EmojiManager} emojiManager
     * @returns
     */
    async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, giftCodeManager, emojiManager) {
        let { user: { id, tag }, user, values } = interaction, giftCodes = await databaseInterface.getObject("gift_codes_list"), fetchedUser = await user.fetch(true), { accentColor } = fetchedUser

        const guild = interaction.guild;
        const serverIconURL = guild ? guild.iconURL({ dynamic: true }) : undefined;

        //Add code item
        if (interaction.values == "addCode") {
            let selectOption = client.selectMenus.get("addCodeItem")
            await selectOption.execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t, giftCodeManager)
            return
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        let giftCodesEmbed = new EmbedBuilder()
            .setTitle(`${await emojiManager.getEmoji("emoji_logo")} ${await t("giftcode_manager.main_label")}`)
            .setDescription(`${await emojiManager.getEmoji("emoji_arrow_down_right")} ${await t("giftcode_manager.select_text")}\n\n${await emojiManager.getEmoji("emoji_arrow_right")} **Code:** \`\`\`js\n${giftCodes[interaction.values].code}\`\`\`\n${await emojiManager.getEmoji("emoji_arrow_right")} **Value:** \`\`\`js\n${giftCodes[interaction.values].value} Coins\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)
            .setTimestamp()
            .setFooter({ text: giftCodes[interaction.values].code, iconURL: serverIconURL })

        //Emoji parser
        function parseEmoji(raw) {
            if (!raw) return null;
            if (typeof raw === "string") {
                const m = raw.match(/<a?:([^:>]+):(\d+)>/);
                if (m) return { id: m[2], name: m[1], animated: raw.startsWith("<a:") };
                return raw; // Unicode
            } else if (typeof raw === "object" && raw.id) {
                return { id: raw.id, name: raw.name || undefined, animated: !!raw.animated };
            }
            return null;
        }

        const trashEmoji = parseEmoji(await emojiManager.getEmoji("emoji_trash")) || "🗑️";

        await interaction.editReply({
            embeds: [giftCodesEmbed],
            components: [new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setCustomId("deleteCodeButton")
                    .setLabel(`${await t("giftcode_manager.delete_code_label")}`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(trashEmoji)
            ])],
            flags: MessageFlags.Ephemeral
        })
    }
}