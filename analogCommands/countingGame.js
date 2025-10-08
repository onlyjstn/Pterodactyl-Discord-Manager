const { DataBaseInterface } = require("./../classes/dataBaseInterface");
const { BaseInteraction, Client, Message, EmbedBuilder } = require("discord.js");
const { EconomyManager } = require("./../classes/economyManager");
const countingChannel = require("../commands/countingChannel");
const { TranslationManager } = require("./../classes/translationManager")

const states = {
    INTEGER: "INTEGER",
    BINARY: "BINARY",
    HEXADECIMAL: "HEXADECIMAL",
}

let currentMode = states.INTEGER;
let currentValue = 0;
let userId;

let pickMode = function() {
  let modes = Object.keys(states);
  let modeCount = modes.length
  currentMode = states[modes[Math.floor(Math.random() * modeCount)]]
}

let sendFailureEmbed = async function(givenText, channel, t) {
  const failEmbed = new EmbedBuilder()
    .setTitle(`❌ ${await t("counting.wrong_number_title")}`)
    .setDescription(
      `> <@${userId}> ${await t("counting.wrong_number_text")}\n\n` +
      `**${await t("counting.expected_label")}:** \`${currentValue + 1}\`\n` +
      `**${await t("counting.given_label")}:** \`${givenText}\``
    )
    .setColor(0xE74C3C)
    .setFooter({ text: await t("counting.wrong_number_footer") })
    .setTimestamp();

  await channel.send({ embeds: [failEmbed] })
}

module.exports = {
  customId: "countingGame",
  /**
   * Counting System
   * 
   * @param {Message} message
   * @param {Client} client
   * @param {DataBaseInterface} database
   * @param {EconomyManager} economy
   */
  async execute(message, client, database, economy) {
    let { guildId, author: { bot, id } } = message
    if (!message.inGuild()) return;
    if (bot) return;
    //Check if User has an Account
    let userData = await database.getObject(id)
    if (userData == null) return;
    
    let countingChannel = await database.getObject("countingChannel")

    let translationManager = new TranslationManager(id);
    const t = async function (key) {
        return await translationManager.getTranslation(key)
    }

    console.log(message.channelId)
    console.log(countingChannel)

    if(message.channelId != countingChannel) return;
    userId = id;

    switch(currentMode) {
      case states.INTEGER: 
        console.log(currentValue + 1)
        console.log(message.content)

        if(message.content == currentValue + 1) {
          currentValue++;
          break;
        } 

        sendFailureEmbed(message.content, message.channel, t);
        currentValue = 0;
        break;
    }
  },
};
