const { UtilityCollection } = require("../../classes/utilityCollection");
const {
  BaseInteraction,
  Client,
  SelectMenuBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const utility = new UtilityCollection();

module.exports = {
  customId: "ban",
  /**
   * Developer command for evaluation of javascript
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    if (
      !["USERIDOFADMINHERE"].includes(message.author.id)
    )
      return;
    let { content } = message,
      banData = content.slice(10),
      timeBefore = performance.now();
    // Get User by Discord ID
    //Check for mention
    let member
    let mention = message.mentions.members.first()
    console.log(mention)
    if(mention != undefined) {
      member = mention
    } else {
      try {
    member = await client.users.fetch(banData).member
      } catch(error) {
        message.channel.send("Error banning user: " + error)
        console.error("Error banning user: " + error);
        return
      }
    }
    member
      .ban({ reason: "Banned by Ptero-Manager" })
      .then(() => {
        message.channel.send("User Banned 💀")
        console.log("User banned successfully.");
      })
      .catch((error) => {
        message.channel.send("Error banning user: " + error)
        console.error("Error banning user: " + error);
      });
  },
};
