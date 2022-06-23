console.log(` ______                            _______              _            
(____  \\       _   _              (_______)            | |           
 ____)  ) ____| |_| |_  ____  ____ _____ _   _ ____  _ | | ____  ___ 
|  __  ( / _  )  _)  _)/ _  )/ ___)  ___) | | / _  |/ || |/ _  )/___)
| |__)  | (/ /| |_| |_( (/ /| |   | |____\\ V ( ( | ( (_| ( (/ /|___ |
|______/ \\____)\\___)___)____)_|   |_______)_/ \\_||_|\\____|\\____|___/`);

const socket = io("/");

let canvas, ctx;
let id = -1;
let heldKeys = {"w": false, "a": false, "s": false, "d": false};
let players = [];

window.addEventListener("keydown", (key) => {
    const k = key.key;
    heldKeys[k] = true;
});
window.addEventListener("keyup", (key) => {
    const k = key.key;
    heldKeys[k] = false;
});

socket.on("registerResponse", (response) => {
    document.getElementById("update").innerHTML = response;
});

socket.on("loginResponse", (response, go) => {
    document.getElementById("update").innerHTML = response;
    if (go) {
        document.getElementById("buttons").remove();
        setTimeout(() => {
            document.getElementById("login").remove();
            runGame();
        }, 1250);
    }
});

socket.on("sid", (ide) => {
   id = ide;
});

socket.on("playerUpdate", (playersN) => {
    players = playersN;
});

function register() {
    const username = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    socket.emit("register", username, password);
    document.getElementById("update").innerHTML = "Sent to server, waiting for response.";
}

function login() {
    const username = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    socket.emit("login", username, password);
    document.getElementById("update").innerHTML = "Sent to server, waiting for response.";
}

function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p in players) {
        const player = players[p];
        if (player.color == null) continue;

        ctx.fillStyle = "#" + player.color;

        //Initial ball (player)
        ctx.beginPath();
        ctx.arc(player.x, player.y, 25, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "16px serif";

        // Player name
        ctx.beginPath();
        ctx.fillText(player.name, (player.x - (ctx.measureText(player.name).width / 2)), player.y - 30);
        ctx.fill();
    }
}

function runKeyUpdate() {
    setInterval(() => {
        socket.emit("keyUpdate", heldKeys);
    }, 20);
}

function runGame() {
    canvas = document.createElement("canvas");
    canvas.id = "canvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    animate();
    runKeyUpdate();
}
