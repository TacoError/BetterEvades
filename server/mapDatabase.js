const JSONDb = require("simple-json-db");
const db = new JSONDb("store/map.json");

let map, balls, safeZones;
// Because this is the only one has has to be edited runtime
let activeBalls;

module.exports = {
    initDatabase: () => {
        if (!db.has("walls")) db.set("walls", []);
        if (!db.has("balls")) db.set("balls", []);
        if (!db.has("safeZones")) db.set("safeZones", []);
        db.sync();
        map = db.get("walls");
        balls = db.get("balls");
        safeZones = db.get("safeZones");
        activeBalls = db.get("balls");
        setInterval(() => {
            db.set("map", map);
            db.set("balls", balls);
            db.set("safeZones", safeZones);
            db.sync();
        }, 10000);
    },
    addWallToMap: (x, y, width, height) => {
        map.push({
            x: x,
            y: y,
            width: width,
            height: height
        });
    },
    addSafeZoneToMap: (x, y, width, height) => {
        safeZones.push({
            x: x,
            y: y,
            width: width,
            height: height
        });
    },
    addBallToMap: (x, y, width, height, speed) => {
        const ball = {
            x: x,
            y: y,
            width: width,
            height: height,
            speed: speed,
            type: "regular"
        };
        balls.push(ball);
        ball.dir = "down";
        ball.dirLR = "right";
        activeBalls.push(ball);
    },
    getMap: () => {
        return map;
    },
    getSafeZones: () => {
        return safeZones;
    },
    getBalls: () => {
        return balls;
    },
    updateBalls: () => {
        //TODO: collision checking, there is no collisions to detect as of right now tho...
        const newBalls = [];
        activeBalls.forEach(ball => {
            if (ball.dir === "down") ball.y += ball.speed;
            if (ball.dir === "up") ball.y -= ball.speed;
            if (ball.dirLR === "right") ball.x += ball.speed;
            if (ball.dirLR === "left") ball.x -= ball.speed;
            newBalls.push(ball);
        });
        activeBalls = newBalls;
    },
};