const { DataBaseInterface } = require("./../classes/dataBaseInterface");
const { BaseInteraction, Client, Message } = require("discord.js");
const { EconomyManager } = require("./../classes/economyManager");

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
    
    
  },
};
