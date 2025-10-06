const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const blackjack = require("discord-blackjack");

module.exports = {
  customId: "blackjack",

  /**
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
  async execute(interaction, client, panel, boosterManager, cacheManager, economyManager, logManager, databaseInterface, t) {
  // Defer reply as ephemeral so follow ups are hidden
  await interaction.deferReply({ ephemeral: true });
  const { user: { accentColor, id, tag }, channel } = interaction;
  const userBalance = await economyManager.getUserBalance(id);
  const userDaily = await economyManager.getUserDaily(id);
    //Einsatz Embeds und Select

    const einsatzEmbed = new EmbedBuilder()
      .setTitle(`\`\`\`💰 ${await t("minigames_events.bet_label")} 💰\`\`\``)
      .setDescription(`\`\`\`${await t("minigames_events.bet_text")}\`\`\``)
      .setColor(accentColor ? accentColor : 0xe6b04d)


    const einsatzNoNumber = new EmbedBuilder()
      .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
      .setDescription(`\`\`\`${await t("minigames_events.daily_limit_reached_text")}\`\`\``)
      .setColor(accentColor ? accentColor : 0xe6b04d)


    await interaction.editReply({
      embeds: [einsatzEmbed]
    });

    //Get Messages and Filter for the Users bet
    const filter = (m) => m.author.id === id;
    const blackjackCollector = channel.createMessageCollector({
      filter,
      time: 15000,
      max: 1,
    });

    blackjackCollector.on("collect", async (collected) => {
      let { content: einsatz } = collected
      einsatz = parseInt(einsatz)
      //Try to delete message
      try {
        await collected.delete();
      } catch { }
      //Check if the set User Amount is let than 0
        if (Number.isFinite(einsatz) == false || einsatz <= 0 || einsatz > 150) {
        await interaction.editReply({
          embeds: [einsatzNoNumber]
        });
        //Logging
        await logManager.logString(`${tag} tried to play a minigame with insufficient coins / remaining daily limit.`)
        return;
      }

      //Check if user has enough coins, reached his daily limit, or would reach his daily limit
        if (einsatz * 1.5 > userBalance || userDaily >= 300 || (300 - userDaily) < (einsatz * 1.5)) {
        await interaction.editReply({
          embeds: [einsatzNoNumber]
        });
        //Logging
        await logManager.logString(`${tag} tried to play a minigame with insufficient coins / remaining daily limit.`)
        return;
      }

      //Start Blackjack Game urgh I am too lazy to Code a Blackjack Game myself ;(
      await blackjack(interaction, {
        transition: "update",
      })
        .then(async (res) => {
          let { result } = res


          //User lost ---
          if (result == "LOSE") {
            await economyManager.removeCoins(id, einsatz * 1.5)
            //Reply to User
            await interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`\`\`\`🤴 ${await t("minigames.blackjack_label")} 🤴\`\`\``)
                  .setDescription(`\`\`\`${await t("minigames_events.blackjack_loose_text")} ${einsatz} ${await t("minigames_events.blackjack_loose_text_two")} ${0.5 * einsatz} Coins!\`\`\``)
                  .setColor(accentColor ? accentColor : 0xe6b04d)
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setStyle("Danger")
                    .setCustomId("blackjack")
                    .setLabel(`🔁 ${await t("minigames.replay_label")}`)
                )
              ],
              ephemeral: true
            });
            //Logging
            await logManager.logString(`${tag} lost ${einsatz + 0.5 * einsatz} Coins by playing a minigame with a use of ${einsatz} Coins`)
            return;
          }


          //User cancels game ---
          if (res.result == "CANCEL") {
            await economyManager.removeCoins(id, einsatz)
            await interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`\`\`\`🤴 ${await t("minigames.blackjack_label")} 🤴\`\`\``)
                  .setDescription(`\`\`\`${await t("minigames_events.blackjack_cancel_text")}\`\`\``)
                  .setColor(accentColor ? accentColor : 0xe6b04d)
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setStyle("Danger")
                    .setCustomId("blackjack")
                    .setLabel(`🔁 ${await t("minigames.replay_label")}`)
                )
              ],
              ephemeral: true
            });
            //Logging
            await logManager.logString(`${tag} lost ${einsatz} by cancelling his minigame.`)
            return;
          }

          //User wins --
          if (res.result == "WIN") {
            let gewinn = einsatz * 1.5;
            //Remove and Add Coins to User
            await economyManager.removeCoins(id, einsatz)
            await economyManager.addCoins(id, gewinn)
            await economyManager.addDailyAmount(id, gewinn)

            await interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`\`\`\`🤴 ${await t("minigames.blackjack_label")} 🤴\`\`\``)
                  .setDescription(`\`\`\`${await t("minigames_events.blackjack_won_text")} ${await t("minigames_events.blackjack_won_text_two")} ${gewinn}\n${await t("minigames_events.blackjack_win_text_three")} ${await economyManager.getUserDaily(id)} ${await t("minigames_events.blackjack_win_text_four")}\`\`\``)
                  .setColor(accentColor ? accentColor : 0xe6b04d)
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setStyle("Danger")
                    .setCustomId("blackjack")
                    .setLabel(`🔁 ${await t("minigames.replay_label")}`)
                )
              ],
              ephemeral: true
            });
            //Logging
            await logManager.logString(`${tag} won ${gewinn} Coins by playing a minigame with a use of ${einsatz} Coins`)
            return;
          }
        })


        // Fehler tritt auf --
        .catch(async (res) => {
          await interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setTitle(`\`\`\`⛔ ${await t("errors.error_label")} ⛔\`\`\``)
                .setDescription(`\`\`\`${await t("minigames_events.blackjack_error_text")}\`\`\``)
                .setColor(accentColor ? accentColor : 0xe6b04d)
            ],
            ephemeral: true
          });
          //Logging
          await logManager.logString(`${tag}'s Blackjack Game resulted in an error: ${res}`)
          return;
        });
    });
  },
};
