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
console.log(case1);


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
   // Should we just use the position of x to move along y?
   // Of course we can also calculate y, as below.
   // const y = dy1 * t1 + l1[0].y;
   // l1[0] is our starting position.
   const y = l1[0].y + (x - l1[0].x) * dx1 / dy1;
   return new Vector2(x, y);
}
