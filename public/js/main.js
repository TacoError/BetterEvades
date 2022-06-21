console.log(` ______                            _______              _            
(____  \\       _   _              (_______)            | |           
 ____)  ) ____| |_| |_  ____  ____ _____ _   _ ____  _ | | ____  ___ 
|  __  ( / _  )  _)  _)/ _  )/ ___)  ___) | | / _  |/ || |/ _  )/___)
| |__)  | (/ /| |_| |_( (/ /| |   | |____\\ V ( ( | ( (_| ( (/ /|___ |
|______/ \\____)\\___)___)____)_|   |_______)_/ \\_||_|\\____|\\____|___/`);

const socket = io("/");

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

function runGame() {

}