console.log(`
██████╗░███████╗████████╗████████╗███████╗██████╗░  ███████╗██╗░░░██╗░█████╗░██████╗░███████╗░██████╗
██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗  ██╔════╝██║░░░██║██╔══██╗██╔══██╗██╔════╝██╔════╝
██████╦╝█████╗░░░░░██║░░░░░░██║░░░█████╗░░██████╔╝  █████╗░░╚██╗░██╔╝███████║██║░░██║█████╗░░╚█████╗░
██╔══██╗██╔══╝░░░░░██║░░░░░░██║░░░██╔══╝░░██╔══██╗  ██╔══╝░░░╚████╔╝░██╔══██║██║░░██║██╔══╝░░░╚═══██╗
██████╦╝███████╗░░░██║░░░░░░██║░░░███████╗██║░░██║  ███████╗░░╚██╔╝░░██║░░██║██████╔╝███████╗██████╔╝
╚═════╝░╚══════╝░░░╚═╝░░░░░░╚═╝░░░╚══════╝╚═╝░░╚═╝  ╚══════╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░╚══════╝╚═════╝░`);

let asapFont = new FontFace(
    "Pangolin",
    "url(https://fonts.googleapis.com/css2?family=Asap:ital@1&family=Inter:wght@300&display=swap)"
);

asapFont.load().then((font) => {
    document.fonts.add(font);
    ctx.font = "30px Asap";
});

const socket = io("/");

let canvas, ctx;
let inputBox;
let chatText;

let id = -1;
// R = Draw box
let heldKeys = {"w": false, "a": false, "s": false, "d": false, "r": false, "shift": false};
let players = [];
let walls = [];
// Mouse to real canvas positions
let mx, my;

function handleFinishTexting(e) {
    if (e.key === "Enter") {
        inputBox.blur();
        socket.emit("chatSend", inputBox.value);
        inputBox.value = "";
    }
}

window.addEventListener("mousemove", (move) => {
    try {
        const cBR = canvas.getBoundingClientRect();
        mx = Math.round(move.clientX - cBR.left);
        my = Math.round(move.clientY - cBR.top);
    } catch(_) {}
});

window.addEventListener("keydown", (key) => {
    const k = key.key.toLowerCase();
    if (k === "enter") {
        inputBox.focus();
        return;
    }
    if (inputBox === document.activeElement) return;
    heldKeys[k] = true;
});
window.addEventListener("keyup", (key) => {
    const k = key.key.toLowerCase();
    heldKeys[k] = false;
});

socket.on("registerResponse", (response) => {
    document.getElementById("update").innerHTML = response;
});

socket.on("chat", (chat) => {
    let n = [];
    chat.forEach(c => {
       n.push(c.name + ": " + c.message);
    });
    chatText.innerHTML = n.join("<br>");
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

socket.on("wallsUpdate", (wallsN) => {
    walls = wallsN;
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
        ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.fillStyle = "grey";
        ctx.stroke();

        ctx.fillStyle = "grey";
        ctx.font = "16px Asap";

        // Player name
        ctx.beginPath();
        ctx.fillText(player.name, (player.x - (ctx.measureText(player.name).width / 2)), player.y - 30);
        ctx.fill();
    }

    for (const w in walls) {
        const wall = walls[w];

        ctx.fillStyle = "grey";

        ctx.beginPath();
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        ctx.fill();
    }

}

function runKeyUpdate() {
    setInterval(() => {
        socket.emit("keyUpdate", heldKeys);
        socket.emit("mousePosUpdate", {x: mx, y: my});
    }, 20);
}

function runGame() {
    canvas = document.createElement("canvas");
    canvas.id = "canvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.style.position = "fixed";
    inputBox.style.left = "0px";
    inputBox.style.top = "120px";
    inputBox.onkeydown = handleFinishTexting;
    chatText = document.createElement("p");
    chatText.style.position = "fixed";
    chatText.style.left = "0px";
    chatText.style.top = "0px";
    chatText.style.color = "white";
    document.body.appendChild(chatText);
    document.body.appendChild(inputBox);
    runKeyUpdate();
    animate();
}
