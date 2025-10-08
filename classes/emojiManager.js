const fs = require("fs");
const path = require("path");

class EmojiManager {
    /**
     *
     * Provides a simple way to retreive either custom emojis via id or unicode based emojis if an id is not present
     *
     */

    constructor() {
  this.getEmoji = async function(key) {
            const txt = await fs.promises.readFile(`translations/emojis.json`);
            const json = JSON.parse(txt);
            const entry = json[key];
            if (!entry) return null;
            if (entry.id && String(entry.id).trim().length) return entry.id;
            return entry.emoji ?? null;
        }
    }
}

module.exports = {
    EmojiManager
}
