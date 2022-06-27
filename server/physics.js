const SAT = require("sat");

module.exports = {
    boundPlayerWalls: (p, map) => {
        for (const w of map) {
            if (!w.sat) {
                w.sat = new SAT.Box(new SAT.Vector(w.x, w.y), w.width, w.height).toPolygon();
            }
            // TODO: globally generate a p.sat every frame after movement for all collision functions to use
            p.sat = new SAT.Circle(new SAT.Vector(p.x,p.y),p.radius);
            const response = new SAT.Response();
            const collided = SAT.testPolygonCircle(w.sat, p.sat, response);
            if (collided) {
                p.x += response.overlapV.x;
                p.y += response.overlapV.y;
            }
        }
    }
}