const fs = require('fs');
const path = require('path');

class EmojiManager {


    /**
     * 
     * Provides a simple way to retreive either custom emojis via id or unicode based emojis if an id is not present
     * 
     */

  constructor(root = path.resolve(__dirname, '..')) {
    this.root = root;
    this.file = path.join(this.root, 'translations', 'emojis.json');
  }

  async getEmoji(key) {
    const txt = await fs.promises.readFile(this.file, 'utf8');
    const json = JSON.parse(txt);
    const entry = json[key];
    if (!entry) return null;
    if (entry.id && String(entry.id).trim().length) return entry.id;
    return entry.emoji ?? null;
  }
}

module.exports = EmojiManager;