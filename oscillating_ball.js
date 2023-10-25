const period = 270;
const frequency = 4;
class OscillatingBall {
    constructor(element, position) {
        this.element = element;
        this.position = position;
        this.startingPosition = position;
        this.frames = 0;
    }
    update() {
        this.frames++;
        if (this.frames > period) return;
        
        this.position.y = this.startingPosition.y + Math.sin((this.frames / period * 2 * Math.PI) * frequency) * ((period - this.frames) / period);
    }
    render() {
        renderElement(this.element, this.position);
    }
}