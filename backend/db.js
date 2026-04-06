const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'chat.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                senderId TEXT NOT NULL,
                senderName TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                isPinned BOOLEAN DEFAULT 0,
                isDeletedForEveryone BOOLEAN DEFAULT 0,
                deletedBy TEXT DEFAULT '[]'
            )
        `);
    });
}

function getMessages(userId, callback) {
    db.all(`SELECT * FROM messages ORDER BY timestamp ASC`, [], (err, rows) => {
        if (err) {
            return callback(err, null);
        }
        // Filter and transform messages for the requesting user
        const result = rows.filter(row => {
            const deletedBy = JSON.parse(row.deletedBy || '[]');
            return !deletedBy.includes(userId);
        }).map(row => {
            if (row.isDeletedForEveryone) {
                return { ...row, text: 'This message was deleted' };
            }
            return row;
        });
        callback(null, result);
    });
}

function addMessage(text, senderId, senderName, callback) {
    const timestamp = Date.now();
    db.run(
        `INSERT INTO messages (text, senderId, senderName, timestamp) VALUES (?, ?, ?, ?)`,
        [text, senderId, senderName, timestamp],
        function (err) {
            if (err) {
                return callback(err, null);
            }
            db.get(`SELECT * FROM messages WHERE id = ?`, [this.lastID], (err, row) => {
                callback(err, row);
            });
        }
    );
}

function pinMessage(id, isPinned, callback) {
    db.run(`UPDATE messages SET isPinned = ? WHERE id = ?`, [isPinned ? 1 : 0, id], function (err) {
        callback(err, this.changes);
    });
}

function deleteMessage(id, userId, type, callback) {
    if (type === 'everyone') {
        db.run(`UPDATE messages SET isDeletedForEveryone = 1 WHERE id = ?`, [id], function (err) {
            callback(err, this.changes);
        });
    } else {
        // delete for me
        db.get(`SELECT deletedBy FROM messages WHERE id = ?`, [id], (err, row) => {
            if (err || !row) return callback(err, 0);
            const deletedBy = JSON.parse(row.deletedBy || '[]');
            if (!deletedBy.includes(userId)) {
                deletedBy.push(userId);
                db.run(`UPDATE messages SET deletedBy = ? WHERE id = ?`, [JSON.stringify(deletedBy), id], function (err) {
                    callback(err, this.changes);
                });
            } else {
                callback(null, 1);
            }
        });
    }
}

module.exports = {
    db,
    getMessages,
    addMessage,
    pinMessage,
    deleteMessage
};
