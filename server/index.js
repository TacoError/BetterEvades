const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const db = require("./database.js");
db.initDatabase();

app.use(express.static("../public"));
server.listen(4000, () => {
    console.log("Opened at http://localhost:4000");
});

io.on("connection", (socket) => {
    console.log("Connection made.")
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
    });
    socket.on("disconnect", () => {

        console.log("Connection terminated.");
    });
});

