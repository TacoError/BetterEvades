const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const config = require("../config.json");

const fs = require("fs");
if (!fs.existsSync("store")) {
    fs.mkdirSync("store");
}

const db = require("./database.js");
db.initDatabase();

const mapDB = require("./mapDatabase.js");
mapDB.initDatabase();

app.use(express.static("../public"));
server.listen(config.port, () => {
    console.log("Opened at http://localhost:4000");
});

const players = new Map();
let curr = 0;

io.on("connection", (socket) => {
    console.log("Connection made.")
    curr++;
    socket.on("register", (name, password) => {
        if (!name.match("^[a-zA-Z0-9_\.\-]*$")) {
            io.to(socket.id).emit("registerResponse", "Illegal name.");
            return;
        }
        if (name.length < 3 || name.length > 12) {
            io.to(socket.id).emit("registerResponse", "Name must be more than 3 characters and less than 12.");
            return;
        }
        if (db.nameExists(name)) {
            io.to(socket.id).emit("registerResponse", "That name has been taken.");
            return;
        }
        db.register(name, password);
        io.to(socket.id).emit("registerResponse", "Successfully registered, you may now login.");
    });
    socket.on("login", (name, password) => {
        const login = db.tryLogin(name, password);
        if (!login[0]) {
            io.to(socket.id).emit("loginResponse", login[1], false);
            return;
        }
        io.to(socket.id).emit("loginResponse", login[1], true);
        const id = curr;
        players.set(socket.id, {
            id: id,
            x: 0,
            y: 0,
            name: name,
            color: Math.floor(Math.random() * 16777215).toString(16)
        });
        io.to(socket.id).emit("sid", id);
    });
    socket.on("keyUpdate", (keys) => {
        const old = players.get(socket.id);
        if (keys["w"]) old.y -= config.speed;
        if (keys["s"]) old.y += config.speed;
        if (keys["a"]) old.x -= config.speed;
        if (keys["d"]) old.x += config.speed;
        players.set(socket.id, old);
        io.to(socket.id).emit("playerUpdate", Array.from(players.values()));
    });
    socket.on("disconnect", () => {
        players.delete(socket.id);
        console.log("Connection terminated.");
    });
});

setInterval(() => {
    mapDB.updateBalls();
}, 50);
