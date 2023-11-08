class Polygon {
    constructor(points) {
        this.points = points;
    }

    set(polygon) {
        this.points = [];
        for (const point of polygon.points) {
            this.points.push(point.clone());
        }
    }

    clone() {
        let polygon = new Polygon();
        polygon.set(this);
        return polygon;
    }

    toString() {
        if (this.points.length === 0) {
            return "{}";
        }

        let points = "";
        for (let i = 0; i < this.points.length - 1; i++) {
            points += this.points[i].toString() + ", ";
        }
        points += this.points[this.points.length - 1].toString();

        return "{" + points + "}";
    }

    // Returns the polygon which was collided with, 
    //  the index of the side it collided with,
    //  and the location the collision happened.
    // Probably want to also consider the sliding velocity, but this might not have
    //  to be a return value, could be another function.
    calcCollision(polygons, velocity, renderCalls=[]) {
        // Of course this isn't working with vertical lines, because slopeSolve won't work with that
        //  at first.
        function slopeSolve(movingPoint, side) {
            class Line {
                constructor(twoPoints) {
                    const [p1, p2] = twoPoints;
                    this.m = (p2.y - p1.y) / (p2.x - p1.x);
                    this.b = p1.y - this.m * p1.x;
                }
            }

            // To deal with if side is vertical
            if (Math.abs(side[0].x - side[1].x) / Math.abs(side[0].y - side[1].y) < 0.01) {
                const movingPointLine = new Line(movingPoint);
                const x = side[0].x;
                const y = movingPointLine.m * x + movingPointLine.b;
                return new Vector2(x, y);
            }

            const movingPointLine = new Line(movingPoint);
            const sideLine = new Line(side);
            const x = (movingPointLine.b - sideLine.b) / (sideLine.m - movingPointLine.m);
            const y = sideLine.m * x + sideLine.b;

            return new Vector2(x, y);
        }

        function boundingBoxVerify(intersectionFunc, movingPoint, side) {
            const intersection = intersectionFunc(movingPoint, side);
            function inBounds(lineSegment) {
                const minX = Math.min(lineSegment[0].x, lineSegment[1].x);
                const maxX = Math.max(lineSegment[0].x, lineSegment[1].x);
                const minY = Math.min(lineSegment[0].y, lineSegment[1].y);
                const maxY = Math.max(lineSegment[0].y, lineSegment[1].y);
                return (minX <= intersection.x && intersection.x <= maxX)
                    && (minY <= intersection.y && intersection.y <= maxY);
            }
            const interMinX = Math.min(movingPoint[0].x, movingPoint[1].x);
            const interMaxX = Math.max(movingPoint[0].x, movingPoint[1].x);
            const interMinY = Math.min(movingPoint[0].y, movingPoint[1].y);
            const interMaxY = Math.max(movingPoint[0].y, movingPoint[1].y);
            const sideMinX = Math.min(side[0].x, side[1].x);
            const sideMaxX = Math.max(side[0].x, side[1].x);
            const sideMinY = Math.min(side[0].y, side[1].y);
            const sideMaxY = Math.max(side[0].y, side[1].y);

            // if (minX <= intersection.x && intersection.x <= maxX) {
            // if (minY <= intersection.y && intersection.y <= maxY) {
            if (inBounds(movingPoint) && inBounds(side)) {
                return intersection;
            }
            return null;
        }

        class Collision {
            constructor(intersection, point, side) {
                this.intersection = intersection;
                this.point = point;
                this.side = side;
            }
        }

        let collisionDist = Infinity;
        let closestCollision = null;

        for (const point of this.points) {
            const movingPoint = [point, point.plus(velocity)];
            renderCalls.push(() => {
                const canvas = document.getElementById("debug-layer");
                let ctx = canvas.getContext("2d");
                ctx.lineWidth = 6;
                ctx.strokeStyle = `rgb(0, 255, 255)`;
                ctx.beginPath();
                ctx.moveTo(Math.floor(movingPoint[0].x), Math.floor(movingPoint[0].y));
                ctx.lineTo(Math.floor(movingPoint[1].x), Math.floor(movingPoint[1].y));
                ctx.stroke();
            });

            // For now, try determining the closest side we are colliding with.
            for (const polygon of polygons) {
                const sides = polygon.getSides();

                for (const side of sides) {
                    // The most important part of the algorithm is figuring out where,
                    // and if, the side collides with the player.
                    const intersection = boundingBoxVerify(slopeSolve, movingPoint, side);
                    if (intersection === null) {
                        continue;
                    }

                    const dist = intersection.minus(point).mag();
                    if (dist < collisionDist) {
                        collisionDist = dist;
                        closestCollision = new Collision(intersection, point, side);
                    }
                }
            }
        }

        if (closestCollision !== null) {
            console.log(closestCollision.intersection.y);
            renderCalls.push(() => {
                const canvas = document.getElementById("debug-layer");
                let ctx = canvas.getContext("2d");
                ctx.lineWidth = 6;
                ctx.strokeStyle = `rgb(255, 255, 0)`;
                ctx.beginPath();
                ctx.rect(Math.floor(closestCollision.intersection.x) - 5, Math.floor(closestCollision.intersection.y) - 5,
                        10, 10);
                ctx.stroke();
                ctx.strokeStyle = `rgb(255, 0, 0)`;
                ctx.beginPath();
                ctx.moveTo(Math.floor(closestCollision.point.x), Math.floor(closestCollision.point.y));
                ctx.lineTo(Math.floor(closestCollision.point.x + velocity.x), Math.floor(closestCollision.point.y + velocity.y));
                ctx.stroke();
            });
        }
        return closestCollision;
    }

    getSides() {
        let sides = [];
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];
            sides.push([p1, p2]);
        }
        return sides;
    }

    static fromBoundingRect(rect) {
        return new Polygon([
            new Vector2(rect.x, rect.y),
            new Vector2(rect.x + rect.width, rect.y),
            new Vector2(rect.x + rect.width, rect.y + rect.height),
            new Vector2(rect.x, rect.y + rect.height)
        ]);
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromBoundingRect(rect) {
        let vector = new Vector2(rect.x, rect.y);
        return vector;
    }

    mag() {
        return Math.sqrt(this.x * this.x, this.y * this.y);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    plus(vector2) {
        return new Vector2(this.x + vector2.x, this.y + vector2.y);
    } 

    minus(vector2) {
        return new Vector2(this.x - vector2.x, this.y - vector2.y);
    }

    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
    }

    sub(vector2) {
        this.x -= vector2.x;
        this.y -= vector2.y;
    }

    toString() {
        return "<" + this.x + ", " + this.y + ">";
    }
}

class Entity {
    constructor(element, position, bounds) {
        this.element = element;
        this.position = position;
        this.bounds = bounds;
    }
}