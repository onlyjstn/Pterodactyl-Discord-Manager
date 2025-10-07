
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js')

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣']
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
  const deck = []
  for (const s of suits) for (const r of ranks) deck.push({suit: s, rank: r})
  return shuffle(deck)
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

function valueOf(rank) {
  if (rank === 'A') return 11
  if (['J','Q','K'].includes(rank)) return 10
  return parseInt(rank)
}

function handValue(cards) {
  let total = 0
  let aces = 0
  for (const c of cards) {
    const v = valueOf(c.rank)
    total += v
    if (c.rank === 'A') aces++
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

function cardToString(c) {
  return `${c.rank}${c.suit}`
}

function handToString(cards) {
  return cards.map(cardToString).join(' ')
}

async function playGame(interaction, { transition = 'update', bet = 0, t } = {}) {
  const deck = createDeck()
  const playerHands = [] // array of hands 
  playerHands.push([deck.pop(), deck.pop()])
  // track doubled status per hand (double bet taken)
  const doubledFlags = [false]
  let dealer = [deck.pop(), deck.pop()]
  const results = { result: null }

  const embedFor = async (handIndex) => {
    const hand = playerHands[handIndex]
    const playerTotal = handValue(hand)
    const dealerShown = handToString([dealer[0], {suit:'?', rank:'?'}])
    // safe translation helper
    const safe = async (k, def) => {
      try {
        if (!t) return def
        const v = await t(k)
        return typeof v === 'string' && v.length ? v : def
      } catch (e) {
        return def
      }
    }
    const label = await safe("minigames.blackjack_label", 'Blackjack')
      const color = interaction.user && interaction.user.accentColor ? interaction.user.accentColor : 0x2b2d31
      const embed = new EmbedBuilder()
        .setTitle(`🎲 ${label}`)
        .setColor(color)
        .addFields(
        { name: await safe('minigames.your_hand', 'Your Hand'), value: `${handToString(hand)}\n**Total:** ${playerTotal}`, inline: false },
        { name: await safe('minigames.dealer_shown', 'Dealer'), value: `${cardToString(dealer[0])} ??`, inline: false }
        )
      .setFooter({ text: `${await safe('minigames.bet_label_short', 'Bet')}: ${bet}` })
        .setTimestamp()
      return embed
  }

  async function buttonsRow(disabled=false, handIndex=0) {
  const safe = async (k, def) => {
    try {
      if (!t) return def
      const v = await t(k)
      return typeof v === 'string' && v.length ? v : def
    } catch (e) {
      return def
    }
  }
  const hitLabel = await safe('minigames.hit', 'Hit')
  const standLabel = await safe('minigames.stand', 'Stand')
  const doubleLabel = await safe('minigames.double', 'Double')
  const splitLabel = await safe('minigames.split', 'Split')
  const cancelLabel = await safe('minigames.cancel', 'Cancel')

  // rule checks
  const hand = playerHands[handIndex]
  const canDouble = hand && hand.length === 2 && doubledFlags[handIndex] !== true
  // allow split only when hand has exactly 2 cards of same rank and not too many hands already (limit 4)
  const canSplit = hand && hand.length === 2 && hand[0].rank === hand[1].rank && playerHands.length < 4

  const components = []
  components.push(new ButtonBuilder().setCustomId('pdm-bj-hit').setLabel('🟢 ' + hitLabel).setStyle(ButtonStyle.Primary).setDisabled(disabled))
  components.push(new ButtonBuilder().setCustomId('pdm-bj-stand').setLabel('🛑 ' + standLabel).setStyle(ButtonStyle.Danger).setDisabled(disabled))
  if (canDouble) components.push(new ButtonBuilder().setCustomId('pdm-bj-double').setLabel('✳️ ' + doubleLabel).setStyle(ButtonStyle.Primary).setDisabled(disabled))
  if (canSplit) components.push(new ButtonBuilder().setCustomId('pdm-bj-split').setLabel('🔀 ' + splitLabel).setStyle(ButtonStyle.Secondary).setDisabled(disabled))
  components.push(new ButtonBuilder().setCustomId('pdm-bj-cancel').setLabel('❌ ' + cancelLabel).setStyle(ButtonStyle.Secondary).setDisabled(disabled))

  return new ActionRowBuilder().addComponents(...components)
  }


  const finalizeDealer = () => {
    while (handValue(dealer) < 17) {
      dealer.push(deck.pop())
    }
  }

 
  const initial = await interaction.editReply({ embeds: [await embedFor(0)], components: [await buttonsRow(false, 0)] })

  
  const collector = initial.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 })

  let activeHandIndex = 0
  let doubled = false

  return new Promise((resolve, reject) => {
    collector.on('collect', async (i) => {
      try {
        const id = i.customId
        if (id === 'pdm-bj-hit') {
          playerHands[activeHandIndex].push(deck.pop())
          const val = handValue(playerHands[activeHandIndex])
          if (val > 21) {
            // bust
            await i.update({ embeds: [await embedFor(activeHandIndex)], components: [await buttonsRow(true, activeHandIndex)] })
            collector.stop('bust')
            return
          } else {
            await i.update({ embeds: [await embedFor(activeHandIndex)], components: [await buttonsRow(false, activeHandIndex)] })
            return
          }
        }
  if (id === 'pdm-bj-stand') {
    
            if (activeHandIndex < playerHands.length - 1) {
            activeHandIndex++
            await i.update({ embeds: [await embedFor(activeHandIndex)], components: [await buttonsRow(false, activeHandIndex)] })
            return
          } else {
            // finalize
            await i.update({ embeds: [await embedFor(activeHandIndex)], components: [await buttonsRow(true, activeHandIndex)] })
            collector.stop('stand')
            return
          }
        }
  if (id === 'pdm-bj-double') {
          // double: take one card and stand
          playerHands[activeHandIndex].push(deck.pop())
          // mark doubled for this hand
          doubledFlags[activeHandIndex] = true
          await i.update({ embeds: [await embedFor(activeHandIndex)], components: [await buttonsRow(true, activeHandIndex)] })
          collector.stop('double')
          return
        }
  if (id === 'pdm-bj-split') {
          const hand = playerHands[activeHandIndex]
          if (hand.length === 2 && hand[0].rank === hand[1].rank) {
            // perform split
            const cardA = hand[0]
            const cardB = hand[1]
            playerHands[activeHandIndex] = [cardA, deck.pop()]
            playerHands.splice(activeHandIndex+1, 0, [cardB, deck.pop()])
            // insert doubled flag for new hand
            doubledFlags.splice(activeHandIndex+1, 0, false)
            await i.update({ embeds: [await embedFor(activeHandIndex)], components: [await buttonsRow(false, activeHandIndex)] })
            return
          } else {
            await i.reply({ content: 'Cannot split', ephemeral: true })
            return
          }
        }
        if (id === 'pdm-bj-cancel') {
          await i.update({ embeds: [new EmbedBuilder().setDescription('Cancelled')], components: [] })
          collector.stop('cancel')
          return
        }
      } catch (err) {
        collector.stop('error')
        return
      }
    })

    collector.on('end', async (collected, reason) => {
      try {
        if (reason === 'cancel') return resolve({ result: 'CANCEL' })
        
        finalizeDealer()
        const outcomes = []
        for (const hand of playerHands) {
          const pval = handValue(hand)
          const dval = handValue(dealer)
          if (pval > 21) outcomes.push('LOSE')
          else if (dval > 21) outcomes.push('WIN')
          else if (pval > dval) outcomes.push('WIN')
          else if (pval < dval) outcomes.push('LOSE')
          else outcomes.push('PUSH')
        }
        
  const multipliers = doubledFlags.map(f => f ? 2 : 1)
  if (outcomes.includes('WIN')) return resolve({ result: 'WIN', outcomes, dealer: handToString(dealer), multipliers })
  if (outcomes.every(o => o === 'PUSH')) return resolve({ result: 'PUSH', outcomes, dealer: handToString(dealer), multipliers })
  return resolve({ result: 'LOSE', outcomes, dealer: handToString(dealer), multipliers })
      } catch (err) {
        return reject(err)
      }
    })
  })
}

module.exports = { playGame, handValue, handToString }
