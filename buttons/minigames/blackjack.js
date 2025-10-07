const { SlashCommandBuilder } = require("@discordjs/builders");
const { TranslationManager } = require("../../classes/translationManager")
const { PanelManager } = require("../../classes/panelManager")
const { BoosterManager } = require("../../classes/boosterManager")
const { CacheManager } = require("../../classes/cacheManager")
const { EconomyManager } = require("../../classes/economyManager")
const { LogManager } = require("../../classes/logManager")
const { DataBaseInterface } = require("../../classes/dataBaseInterface")
const { BaseInteraction, Client, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")
const { playGame } = require("../../lib/blackjackEngine")

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
      try {
        // charge base bet up-front
        await economyManager.removeCoins(id, einsatz)

        const res = await playGame(interaction, { transition: "update", bet: einsatz, t });
        const { result, outcomes = [], dealer, multipliers = [] } = res;

        // multipliers: array of 1 or 2 per hand (double)

        // determine multipliers (array) and outcomes (array)
        const multipliersArr = multipliers.length ? multipliers : outcomes.map(() => 1)

  // charge extra stakes for splits/doubles (we already removed base bet)
  // multipliersArr contains 1 or 2 per hand; if a hand was doubled we need to charge an extra base bet for it
  const extraCharges = multipliersArr.reduce((acc, m) => acc + (m - 1) * einsatz, 0) + Math.max(0, multipliersArr.length - 1) * 0 // splits already accounted by separate hands, base bet removed once
        if (extraCharges > 0) await economyManager.removeCoins(id, extraCharges)

        // compute payouts
        let totalStake = 0
        let totalPayout = 0
        for (let i = 0; i < multipliersArr.length; i++) {
          const m = multipliersArr[i]
          const stake = einsatz * m
          totalStake += stake
          const out = outcomes[i] || 'LOSE'
          if (out === 'WIN') {
            // check for natural blackjack payout (3:2)
            const isNatural = (res.naturals && res.naturals[i])
            const dealerNatural = res.dealerNatural
            if (isNatural && !dealerNatural) {
              // player gets 3:2 on top of their stake
              // return stake + 1.5 * stake as profit => stake * 2.5 total
              totalPayout += Math.floor(stake * 2.5)
            } else {
              // standard win: return stake + equal profit => stake*2
              totalPayout += stake * 2
            }
          } else if (out === 'PUSH') {
            // return stake
            totalPayout += stake
          } else {
            // LOSE => nothing
          }
        }

        // apply payouts in a single operation for efficiency
        if (totalPayout > 0) await economyManager.addCoins(id, totalPayout)
        if (totalPayout > 0) await economyManager.addDailyAmount(id, Math.max(0, totalPayout - totalStake))

        // Build reply summary
        const net = totalPayout - totalStake
        const title = net > 0 ? (await t('minigames.result_win')) || 'You won' : (net < 0 ? (await t('minigames.result_loss')) || 'You lost' : (await t('minigames.result_cancel')) || 'Push'
        )

        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${net > 0 ? '🏆' : net < 0 ? '💀' : '⚪'} ${(await t("minigames.blackjack_label")) || 'Blackjack'} — ${title}`)
              .setColor(accentColor ? accentColor : (net > 0 ? 0x1f8b4c : 0x8b1c1c))
              .addFields(
                { name: (await t('minigames.your_bet')) || 'Your bet', value: `${einsatz}`, inline: true },
                { name: (await t('minigames.won_amount')) || 'Won amount', value: `${Math.max(0, totalPayout - totalStake)}`, inline: true },
                { name: (await t('minigames.loss_amount')) || 'Loss amount', value: `${Math.max(0, totalStake - totalPayout)}`, inline: true },
              )
              .setFooter({ text: `${(await t('minigames.daily_total')) || 'Daily total'}: ${await economyManager.getUserDaily(id)}` })
              .setTimestamp()
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setStyle('Primary')
                .setCustomId('blackjack')
                .setLabel(`🔁 ${await t("minigames.replay_label")}`)
            )
          ],
          ephemeral: true
        });
        // Logging
        await logManager.logString(`${tag} settled blackjack: stake=${totalStake} payout=${totalPayout} net=${net}`)
        return;
      } catch (err) {
        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle(`⛔ ${(await t("errors.error_label")) || 'Error'} — ${(await t('minigames.result_error')) || 'Game error'}`)
              .setColor(accentColor ? accentColor : 0x8b1c1c)
              .setDescription((await t("minigames_events.blackjack_error_text")) || 'An error occurred in this blackjack game!')
              .setFooter({ text: `${(await t('minigames.help_contact')) || 'Contact an admin if this persists'}` })
              .setTimestamp()
          ],
          ephemeral: true
        });
        // Logging
        await logManager.logString(`${tag}'s Blackjack Game resulted in an error: ${err}`)
        return;
      }
    });
  },
};
