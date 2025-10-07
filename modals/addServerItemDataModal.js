const { PanelManager } = require("./../classes/panelManager")
const { TranslationManager } = require("./../classes/translationManager")
const { BoosterManager } = require("./../classes/boosterManager")
const { CacheManager } = require("./../classes/cacheManager")
const { EconomyManager } = require("./../classes/economyManager")
const { LogManager } = require("./../classes/logManager")
const { DataBaseInterface } = require("./../classes/dataBaseInterface")
const { UtilityCollection } = require("./../classes/utilityCollection")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, Base, SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require("discord.js")

module.exports = {
  customId: "addServerItemDataModal",
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
   * @returns
   */
  async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    let { fields, user: { tag, id }, user } = interaction, itemCpu = fields.getTextInputValue("serverCpu"), itemRam = fields.getTextInputValue("serverRam"), fetchedUser = await user.fetch(true), { accentColor } = fetchedUser
    let itemDisk = fields.getTextInputValue("serverDisk"), itemSwap = fields.getTextInputValue("serverSwap"), itemBackups = fields.getTextInputValue("serverBackups")
    let cachedData = await cacheManager.getCachedData(id), { name, price, runtime, description, egg_id: eggId, server_databases: serverDatabases } = cachedData


    //Get Data
    let data = {
      name: name,
      price: price,
      description: description,
      runtime: runtime,
      egg_id: eggId,
      server_databases: serverDatabases,
      server_cpu: itemCpu,
      server_ram: itemRam,
      server_disk: itemDisk,
      server_swap: itemSwap,
      server_backups: itemBackups,
    };
    //Cache Data
    await cacheManager.cacheData(id, data)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`\`\`\`╔ ✅ ${await t("add_item_modal.confirm_label")}\`\`\``)
          .setDescription(`╠ **CPU in %:** ${itemCpu}\n╠ **RAM in MB:** ${itemRam}\n╠ **Disk in MB:** ${itemDisk}\n╠ **Swap in MB:** ${itemSwap}\n╚ **Amount of Backups** ${itemBackups}`)
          .setColor(accentColor ? accentColor : 0xe6b04d)
      ],
  flags: MessageFlags.Ephemeral,
      //Confirm Button
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle("Success")
            .setCustomId("addShopItemDataConfirm")
            .setLabel(`${await t("add_item_modal.button_confirm_text")}`),


          new ButtonBuilder()
            .setStyle("Danger")
            .setCustomId("addShopItemCancel")
            .setLabel(`${await t("add_item_modal.button_cancel_text")}`)
        )
      ],
    });
  },
};
