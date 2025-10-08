const fs = require('fs');
const path = require('path');

class EmojiManager {
  constructor(root = path.resolve(__dirname, '..')) {
    this.root = root;
    this.file = path.join(this.root, 'translations', 'emojis.json');
  }

  // Very simple: read file each time, return id if present (non-empty), else emoji char, or null
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