class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return "<" + this.x + ", " + this.y + ">";
    }
}

// What happens if the line segments do not intersect?

// Case 1: Desmos example
const case1 = axb([new Vector2(3, 4), new Vector2(1, -2)],
    [new Vector2(-2, 0), new Vector2(6, 3)]);
console.log("Desmos example");
console.log(case1);

// Case 2: No intersection, we can check after if the collision makes sense
const movingPointSeg2 = 
    [new Vector2(3, 4), new Vector2(1, -2)];
const sideSeg2 = 
    [new Vector2(-2, 0), new Vector2(-6, 3)];
const case2 = axb(movingPointSeg2, sideSeg2);
console.log("no intersection");
console.log(
    (checkBounds(case2, movingPointSeg2, sideSeg2) ? "in bounds " : "not in bounds ")
    + case2);

// Case 3: Vertical
const movingPointSeg3 = 
    [new Vector2(3, 4), new Vector2(1, -2)];
const sideSeg3 = 
    [new Vector2(2, 3), new Vector2(2, -4)];
const case3 = axb(movingPointSeg3, sideSeg3);
console.log("Vertical example");
console.log(
    (checkBounds(case3, movingPointSeg3, sideSeg3) ? "in bounds " : "not in bounds ")
    + case3);

function checkBounds(intersection, movingPointSeg, sideSeg) {
    function inBounds(lineSegment) {
        const minX = Math.min(lineSegment[0].x, lineSegment[1].x);
        const maxX = Math.max(lineSegment[0].x, lineSegment[1].x);
        const minY = Math.min(lineSegment[0].y, lineSegment[1].y);
        const maxY = Math.max(lineSegment[0].y, lineSegment[1].y);
        return (minX <= intersection.x && intersection.x <= maxX)
            && (minY <= intersection.y && intersection.y <= maxY);
    }
    return inBounds(movingPointSeg) && inBounds(sideSeg);
}


`
function checkIntersection(seg1, seg2) {
    /*
    example:
    A line from any point to the points of the other line segment is interrupted by the original line segment.
      \ 
    -----
       \
     */
    // also ofc we need to be careful about vertical slopes.
    const seg1Slope = (seg1[1].y - seg1[0].y) / (seg1[1].x - seg1[0].x);
    const seg1from0to0 = (seg1[0].y - seg2[0].y) / (seg1[0].x - seg2[0].x);
    const seg1from0to1 = (seg1[0].y - seg2[1].y) / (seg1[0].x - seg2[1].x);
    return (seg1from0to0 <= seg1Slope && seg1Slope <= seg1from0to1)
        || (seg1from0to1 <= seg1Slope && seg1Slope <= seg1from0to0);
}
`

function axb(movingPointSeg, side) {
    // Suppose movingPointSeg is line 1, just because.
    const l1 = movingPointSeg;
    const l2 = side;
    // etc...
    const dx1 = l1[1].x - l1[0].x;
    const dy1 = l1[1].y - l1[0].y;
    const ndy2 = l2[0].y - l2[1].y;
    const det = dx1 * ndy2 - (l2[0].x - l2[1].x) * dy1;
    const AInvRow1 = [
        (l2[0].y - l2[1].y) / det, 
        (l2[1].x - l2[0].x) / det
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
    const t1 = AInvRow1[0] * b[0] + AInvRow1[1] * b[1];
    console.log("t1 = " + t1);

    const x = dx1 * t1 + l1[0].x;
    // Should we just use the position of x to move along y?
    // Of course we can also calculate y, as below.
    // const y = dy1 * t1 + l1[0].y;
    // l1[0] is our starting position.
    const y = l1[0].y + (x - l1[0].x) * dy1 / dx1;
    return new Vector2(x, y);
}
