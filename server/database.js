const JSONDb = require("simple-json-db");
const db = new JSONDb("store/data.json");

const crypto = require("crypto");

module.exports = {
    initDatabase: () => {
        setInterval(() => {
            db.sync();
        }, 10000);
    },
    nameExists: (name) => {
        return db.has(name);
    },
    register: (name, password) => {
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

        db.set(name, {
            salt: salt,
            hash: hash,
            balance: 0
        });
    },
    tryLogin: (name, password) => {
        if (!db.has(name)) {
            return [false, "Username doesn't exist."];
        }
        const user = db.get(name);
        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, "sha512").toString("hex");
        if (hash === user.hash) {
            return [true, "Successfully logged in. Running game..."];
        }
        return [false, "Incorrect password."];
    }
};