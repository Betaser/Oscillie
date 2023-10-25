class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromBoundingRect(rect) {
        let vector = new Vector2(rect.x, rect.y);
        return vector;
    }
    toString() {
        return "<" + this.x + ", " + this.y + ">";
    }
}