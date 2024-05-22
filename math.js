let GAP_DIST = 3;

function relativeCenterOf(bounds) {
    return new Vector2(
        (bounds.right - bounds.left) / 2,
        (bounds.bottom - bounds.top) / 2
    );
}

const PI_OVER_4_MAT = radToMat(Math.PI / 4);
const NEG_PI_OVER_4_MAT = radToMat(-Math.PI / 4);

function radToMat(rad) {
    let mat = [[], []];
    mat[0][0] = Math.cos(rad);
    mat[1][0] = -Math.sin(rad);
    mat[0][1] = Math.sin(rad);
    mat[1][1] = Math.cos(rad);
    return mat;
}

function toString(mat) {
    return `[ [${mat[0][0].toFixed(3)}] [${mat[1][0].toFixed(3)}]\n  [${mat[0][1].toFixed(3)}] [${mat[1][1].toFixed(3)}] ]`; 
}

function applyRotation(toThis, mat) {
    return new Vector2(
        toThis.x * mat[0][0] + toThis.y * mat[1][0],
        toThis.x * mat[0][1] + toThis.y * mat[1][1]
    );
}

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

    // TODO: Apply rotation matrix to relevant points before calculation (and then reverse the rotation on the result) so that no lines are weird and vertical.
    //  This will allow anything close to vertical to work just as accurately as a randomly sloped line.
    // Then, we also will add an error forgiveness to intersection bounds checking on two line segments.
    // We then compare two line sides, one of which may not supposed to be intersecting but the other is. 
    //  By compare I mean see which midpoint of the line to the center of the shape forms a vector more in line with the polygon's velocity.

    // Returns the polygon which was collided with, 
    //  the index of the side it collided with,
    //  and the location the collision happened.
    // Probably want to also consider the sliding velocity, but this might not have
    //  to be a return value, could be another function.
    // RenderCalls is like an optional out variable that you could totally ignore.

    // TODO: The issue is if you nestle right up against the bottom right corner of mound 2 and 3.
    // Then angle to the left.
    // We can see from the preview that we first want to push away from the bottom mound (mound 2), which actually
    //  forces us into mound 3 because we need to have negative displacement to have a large enough GAP away
    //  from the bottom mound.
    // Because we then move there before doing the slide move, we glitch into mound 3 and can't get out.
    // The first thing that comes to mind is having a check if we hit something while trying to maintain GAP.
    calcCollision(polygons, velocity, renderCalls=[], forPrinting=[]) {
        // clean linear algebra method of solving it
        function axb(movingPointSeg, side) {
            // Suppose movingPointSeg is line 1, just because.
            const l1 = movingPointSeg;
            const l2 = side;
            // etc...
            const dx1 = l1[1].x - l1[0].x;
            const dy1 = l1[1].y - l1[0].y;
            const ARow1 = [
                dx1, l2[0].x - l2[1].x
                // row 2 of A: 
                // [ l1[1].y - l1[0].y, -(l2[1].y - l2[1].y) ]
            ];
            const b = [ l2[0].x - l1[0].x, l2[0].y - l1[0].y ];
            // We only need to calculate the parameteric t variable for line1, 
            //  which'll be only the first element of A^-1 * b.
            /*
            IF
            A = [[a b]  b = [x
                 [c d]]      y]
            Then Ab's first element is equal to ax + by.
            */
           const t1 = ARow1[0] * b[0] + ARow1[1] * b[1];
           const x = dx1 * t1 + l1[0].x;
           const y = dy1 * t1 + l1[0].y;
           return new Vector2(x, y);
        }

        // There is a hacky check for roughly vertical lines, to work with slope math.
        // This needed an added if statement for perfectly vertical movement.
        function slopeSolve(movingPointSeg, side) {
            class Line {
                constructor(twoPoints) {
                    const [p1, p2] = twoPoints;
                    this.m = (p2.y - p1.y) / (p2.x - p1.x);
                    this.b = p1.y - this.m * p1.x;
                }
            }

            // To deal with if side is vertical
            if (Math.abs((side[0].x - side[1].x) / (side[0].y - side[1].y)) < 0.01) {
                const movingPointSegLine = new Line(movingPointSeg);
                const x = side[0].x;
                const y = movingPointSegLine.m * x + movingPointSegLine.b;
                return new Vector2(x, y);
            }

            // We have an issue with the movingPointSeg being vertical.
            // We get NaN results because the movingPointSegLine.m is Infinity.
            if (Math.abs((movingPointSeg[0].x - movingPointSeg[1].x) 
                       / (movingPointSeg[0].y - movingPointSeg[1].y)) < 0.01) {
                const sideLine = new Line(side);
                const x = movingPointSeg[0].x;
                const y = sideLine.m * x + sideLine.b;
                return new Vector2(x, y);
                // console.log("movingPointSeg slope = " + movingPointSegLine.m);
                // console.log("x = " + x + " y = " + y);
            }

            const movingPointSegLine = new Line(movingPointSeg);
            const sideLine = new Line(side);
            const x = (movingPointSegLine.b - sideLine.b) / (sideLine.m - movingPointSegLine.m);
            const y = sideLine.m * x + sideLine.b;

            return new Vector2(x, y);
        }

        // This just doesn't work a lot of the time.
        function rotationMatMethod(movingPointSeg, sideSeg) {
            class Line {
                constructor(twoPoints) {
                    const [p1, p2] = twoPoints;
                    this.m = (p2.y - p1.y) / (p2.x - p1.x);
                    this.b = p1.y - this.m * p1.x;
                }
            }

            // blah blah todo. copy from the C++ stuff.
            const dx1 = movingPointSeg[0].x - movingPointSeg[1].x;
            const dy1 = movingPointSeg[0].y - movingPointSeg[1].y;
            const dx2 = sideSeg[0].x - sideSeg[1].x;
            const dy2 = sideSeg[0].y - sideSeg[1].y;

            const VERT_ENOUGH = 2;
            function rotateLine(line, mat) {
                const pt1 = applyRotation(line[0], mat);
                const pt2 = applyRotation(line[1], mat);
                return [ pt1, pt2 ];
            }

            // Edge case is when both lines are very far away from vertical.
            const bothLinesOk = (dx1 === 0 || dx2 === 0) ? true : !(Math.abs(dy1 / dx1) < VERT_ENOUGH && Math.abs(dy2 / dx2) < VERT_ENOUGH);
            let mat, invMat;

            if (bothLinesOk) {
                // cross multiplication comparison of the slopes.
                if (Math.abs(dy1 * dx2) > Math.abs(dx1 * dy2)) {
                    if (dx2 < 0) {
                        mat = PI_OVER_4_MAT;
                        invMat = NEG_PI_OVER_4_MAT;
                    } else {
                        mat = NEG_PI_OVER_4_MAT;
                        invMat = PI_OVER_4_MAT;
                    }
                } else {
                    if (dx1 < 0) {
                        mat = PI_OVER_4_MAT;
                        invMat = NEG_PI_OVER_4_MAT;
                    } else {
                        mat = NEG_PI_OVER_4_MAT;
                        invMat = PI_OVER_4_MAT;
                    }
                }

                movingPointSeg = rotateLine(movingPointSeg, mat);
                sideSeg = rotateLine(sideSeg, mat);
            }

            const movingPointLine = new Line(movingPointSeg);
            const sideLine = new Line(sideSeg);

            const x = (movingPointLine.b - sideLine.b) / (sideLine.m - movingPointLine.m);
            const y = sideLine.m * x + sideLine.b;
            // We don't handle perfectly parallel stuff yet.
            return bothLinesOk ? applyRotation(new Vector2(x, y), invMat) : new Vector2(x, y);
        }

        function boundingBoxVerify(intersectionFunc, movingPointSeg, sideSeg) {
            const intersection = intersectionFunc(movingPointSeg, sideSeg);
            function inBounds(lineSegment) {
                const minX = Math.min(lineSegment[0].x, lineSegment[1].x);
                const maxX = Math.max(lineSegment[0].x, lineSegment[1].x);
                const minY = Math.min(lineSegment[0].y, lineSegment[1].y);
                const maxY = Math.max(lineSegment[0].y, lineSegment[1].y);
                return (minX <= intersection.x && intersection.x <= maxX)
                    && (minY <= intersection.y && intersection.y <= maxY);
            }

            forPrinting.push(`${intersection.toString()} movingPointSeg: ${movingPointSeg} sideSeg ${sideSeg}`);

            if (inBounds(movingPointSeg) && inBounds(sideSeg)) {
                return intersection;
            }
            return null;
        }

        class Collision {
            constructor(intersection, point, side, invertedRaycast=false, polygonRef, sideIdx) {
                this.intersection = intersection;
                this.point = point;
                this.side = side;
                this.invertedRaycast = invertedRaycast;
                // Less for physics.
                this.polygonRef = polygonRef;
                this.sideIdx = sideIdx;
                this.gappedPosition = null;
            }
        }

        let collisionDist = Infinity;
        let closestCollision = null;

        for (const point of this.points) {
            const movingPointSeg = [point, point.plus(velocity)];
            renderCalls.push(() => {
                const canvas = document.getElementById("debug-layer");
                let ctx = canvas.getContext("2d");
                ctx.lineWidth = 6;
                ctx.strokeStyle = `rgb(0, 255, 255)`;
                ctx.beginPath();
                ctx.moveTo(Math.floor(movingPointSeg[0].x), Math.floor(movingPointSeg[0].y));
                ctx.lineTo(Math.floor(movingPointSeg[1].x), Math.floor(movingPointSeg[1].y));
                ctx.stroke();
            });

            // For now, try determining the closest side we are colliding with.
            for (const polygon of polygons) {
                const sides = polygon.getSides();

                let sideIdx = 0;
                for (const side of sides) {
                    // The most important part of the algorithm is figuring out where,
                    // and if, the side collides with the player.
                    // SWITCHING OUT
                    const intersection = boundingBoxVerify(slopeSolve, movingPointSeg, side);
                    // const intersection = boundingBoxVerify(rotationMatMethod, movingPointSeg, side);
                    if (intersection === null) {
                        sideIdx++;
                        continue;
                    }

                    const dist = intersection.minus(point).mag();
                    if (dist < collisionDist) {
                        collisionDist = dist;
                        closestCollision = new Collision(intersection, point, side, false, polygon, sideIdx);
                    }
                    sideIdx++;
                }
            }
        }

        // Iteration with movingPointSeg being from the polygons to collide with.
        for (const polygon of polygons) {
            for (const point of polygon.points) {
                const movingPointSeg = [point, point.minus(velocity)];

                renderCalls.push(() => {
                    const canvas = document.getElementById("debug-layer");
                    let ctx = canvas.getContext("2d");
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = `rgb(0, 255, 155)`;
                    ctx.beginPath();
                    ctx.moveTo(Math.floor(movingPointSeg[0].x), Math.floor(movingPointSeg[0].y));
                    ctx.lineTo(Math.floor(movingPointSeg[1].x), Math.floor(movingPointSeg[1].y));
                    ctx.stroke();
                });

                const sides = this.getSides();

                let sideIdx = 0;
                for (const side of sides) {
                    // The most important part of the algorithm is figuring out where,
                    // and if, the side collides with the player.
                    // SWITCHING OUT
                    const intersection = boundingBoxVerify(slopeSolve, movingPointSeg, side);
                    // const intersection = boundingBoxVerify(rotationMatMethod, movingPointSeg, side);
                    if (intersection === null) {
                        sideIdx++;
                        continue;
                    }

                    const dist = intersection.minus(point).mag();
                    if (dist < collisionDist) {
                        collisionDist = dist;
                        closestCollision = new Collision(intersection, point, side, true, this, sideIdx);
                    }
                    sideIdx++;
                }
            }
        }

        if (closestCollision !== null) {
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
                let start = closestCollision.point;
                let end = closestCollision.invertedRaycast 
                    ? start.minus(velocity) 
                    : start.plus(velocity);
                ctx.moveTo(Math.floor(start.x), Math.floor(start.y));
                // ctx.moveTo(Math.floor(closestCollision.point.x), Math.floor(closestCollision.point.y));
                ctx.lineTo(Math.floor(end.x), Math.floor(end.y));
                // ctx.lineTo(Math.floor(closestCollision.point.x + velocity.x), Math.floor(closestCollision.point.y + velocity.y));
                ctx.stroke();
            });
        }

        return closestCollision;
    }

    // This is in the direction of velocity, possibly including going backwards.
    calcFloatingDisplacementFancy(collision, gapDist=GAP_DIST) {
        const intersection = collision.intersection;
        const toIntersection = intersection.minus(collision.point);
        
        // Do later, for now:
        // const floatingDisplacement = toIntersection.scaled(0.8);

        const side = collision.side;
        // Maybe the following, but that's annoying
        // sin(theta)
        // a x b = |a||b|sin(theta)
        const a = side[0].minus(side[1]);
        const b = toIntersection;
        const sinTheta = a.crossMag(b) / (a.mag() * b.mag());
        // We want the opposite side of SOH
        const hypotenuse = gapDist / sinTheta;
        const ret = toIntersection.normalized().scaled(hypotenuse).negated();
        return ret;
    }

    // Nice and perp out. BUT we just clip into a wall after popping out from the floor.
    calcFloatingDisplacement(collision, gapDist=GAP_DIST) {
        // Use the same push out logic assumptions as in player.
        const side = collision.side[1].minus(collision.side[0]);
        // const perpOut = side.flip().negated().normalized().scaled(gapDist);
        const perpOut = side.perp().negated().normalized().scaled(gapDist);
        return perpOut;
    }

    calcFloatingDisplacementNaive(collision, gapDist=GAP_DIST) {
        const intersection = collision.intersection;
        const toIntersection = intersection.minus(collision.point);
        const floatingDisplacement = toIntersection.normalized().scaled(gapDist);
        return floatingDisplacement.negated();
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

    // Counter-clockwise.
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

    flip() {
        return new Vector2(this.y, this.x);
    }

    perp() {
        return new Vector2(-this.y, this.x);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
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

    negated() {
        return new Vector2(-this.x, -this.y);
    }

    set(vector2) {
        this.x = vector2.x;
        this.y = vector2.y;
    }

    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
    }

    sub(vector2) {
        this.x -= vector2.x;
        this.y -= vector2.y;
    }

    // The cross product of 2 2d vectors gives a vector with only a z component, seems confusing to define here. 
    // But the magnitude of that z component is useful.
    crossMag(vector2) {
        return Math.abs(this.x * vector2.y - this.y * vector2.x);
    }

    dot(vector2) {
        return this.x * vector2.x + this.y * vector2.y;
    }

    along(vector2) {
        return this.dot(vector2) >= 0;
    }

    projected(onto) {
        const ontoMag = onto.mag();
        return onto.scaled(this.dot(onto) / ontoMag / ontoMag);
    }

    scale(factor) {
        this.x *= factor;
        this.y *= factor;
    }

    scaled(factor) {
        let vector = this.clone();
        vector.x *= factor;
        vector.y *= factor;
        return vector;
    }
    
    normalized() {
        let vector = this.clone();
        const mag = vector.mag();
        vector.x /= mag;
        vector.y /= mag;  
        return vector;
    }

    toString() {
        return "<" + this.x + ", " + this.y + ">";
    }
}