class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromBoundingRect(rect) {
        let vector = new Vector2(rect.x, rect.y);
        return vector;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    plus(vector2) {
        return new Vector2(this.x + vector2.x, this.x + vector2.y);
    } 
    minus(vector2) {
        return new Vector2(this.x - vector2.x, this.x - vector2.y);
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