const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, escapeInlineCode } = require("discord.js")
const { UtilityCollection } = require("../../classes/utilityCollection");


module.exports = {
  customId: "zahlenRaten",

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
    await interaction.deferReply({ ephemeral: true }), { user: { accentColor, id, tag }, channel } = interaction, userBalance = await economyManager.getUserBalance(id), userDaily = await economyManager.getUserDaily(id)
    let utility = new UtilityCollection()
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
      embeds: [einsatzEmbed],
      ephemeral: true
    });

    //Get Messages and Filter for the Users bet
    const filter = (m) => m.author.id === id;
    const zahlenCollector = channel.createMessageCollector({
      filter,
      time: 15000,
      max: 1,
    });

    zahlenCollector.on("collect", async (collected) => {
      let { content: einsatz } = collected
      einsatz = parseInt(einsatz)
      try {
        await collected.delete();
      } catch { }
      //Check if the set User Amount is let than 0
      if (Number.isFinite(einsatz) == false || einsatz <= 0 || einsatz > 150) {
        await interaction.editReply({
          embeds: [einsatzNoNumber],
          ephemeral: true
        });
        //Logging
        await logManager.logString(`${tag} tried to play a minigame with insufficient coins / remaining daily limit.`)
        return;
      }

      //Check if user has enough coins, reached his daily limit, or would reach his daily limit
      console.log(einsatz + "  " + userDaily)
      if (einsatz > userBalance || userDaily >= 300 || (300 - userDaily) < (einsatz * 2)) {
        await interaction.editReply({
          embeds: [einsatzNoNumber],
          ephemeral: true
        });
        //Logging
        await logManager.logString(`${tag} tried to play a minigame with insufficient coins / remaining daily limit.`)
        return;
      }

      //Reply to User
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`\`\`🔢 ${await t("minigames_events.guess_the_number_main_label")} 🔢\`\`\``)
            .setDescription(`**\`\`\`${await t("minigames_events.guess_the_number_main_text")} ${einsatz} Coins!\`\`\`**\n\`\`\`${await t("minigames_events.guess_the_number_main_text_two")}\`\`\``)
            .setColor(accentColor ? accentColor : 0xe6b04d)

        ],
        ephemeral: true,
      });

      await economyManager.removeCoins(id, einsatz), randomResult = await utility.getRandomInteger(5)

      //Game Collector
      const filter = (m) => m.author.id === id;
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 15000,
        max: 1,
      });
      collector.on("collect", async (collected) => {
        let { content: guess } = collected
        try {
          await collected.delete();
        } catch { }
        //Check if the User guessed the correct Number
        if (!Number.isFinite(guess) || guess < 0 || guess > 5) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`\`\`\`🔢 ${await t("minigames_events.guess_the_number_main_label")} 🔢\`\`\``)
                .setDescription(`\`\`\`${await t("minigames_events.guess_the_number_loose_text")} ${randomResult}!\n${await t("minigames_events.guess_the_number_loose_text_two")}\`\`\``)
                .setColor(accentColor ? accentColor : 0xe6b04d)
            ],
            ephemeral: true,
          });
          //Logging
          await logManager.logString(`${tag} lost ${einsatz} Coins by playing a minigame.`)
          return;
        }


        //User won
        if (randomResult == guess) {
          await economyManager.addCoins(id, einsatz * 2)
          await economyManager.addDailyAmount(id, einsatz * 2)

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`\`\`\`🔢 ${await t("minigames_events.guess_the_number_main_label")} 🔢\`\`\``)
                .setDescription(`**\`\`\`${await t("minigames_events.guess_the_number_win_text")}\`\`\`**\n\`\`\`${await t("minigames_events.guess_the_number_win_text_two")} ${einsatz * 2} ${await t("minigames_events.guess_the_number_win_text_three")} ${await economyManager.getUserDaily(id)} ${await t("minigames_events.guess_the_number_win_text_four")}\`\`\``)
                .setColor(accentColor ? accentColor : 0xe6b04d)
            ],
            ephemeral: true
          })
          //Logging
          await logManager.logString(`${interaction.user.tag} won ${einsatz * 2} Coins by playing a minigame with a use of ${einsatz} Coins`)
          return;
        }


        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`\`\`\`🔢 ${await t("minigames_events.guess_the_number_main_label")} 🔢\`\`\``)
              .setDescription(`\`\`\`${await t("minigames_events.guess_the_number_loose_text")} ${randomResult}!\n${await t("minigames_events.guess_the_number_loose_text_two")}\`\`\``)
              .setColor(accentColor ? accentColor : 0xe6b04d)
          ],
          ephemeral: true,
        });
        //Logging
        await logManager.logString(`${tag} lost ${einsatz} Coins by playing a minigame.`)
        return;
      });
    });
  },
};
