const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'urls.db');
const db = new sqlite3.Database(dbPath);

const database = {
  init: () => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS urls (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          short_code TEXT UNIQUE NOT NULL,
          original_url TEXT NOT NULL,
          clicks INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Database initialized');
    });
  },

  create: (shortCode, originalUrl) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
        [shortCode, originalUrl],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, short_code: shortCode, original_url: originalUrl });
        }
      );
    });
  },

  getByShortCode: (shortCode) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM urls WHERE short_code = ?',
        [shortCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  getByUrl: (url) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM urls WHERE original_url = ?',
        [url],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  incrementClicks: (shortCode) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE urls SET clicks = clicks + 1, updated_at = CURRENT_TIMESTAMP WHERE short_code = ?',
        [shortCode],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM urls ORDER BY created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  },

  delete: (shortCode) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM urls WHERE short_code = ?',
        [shortCode],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
};

module.exports = database;
