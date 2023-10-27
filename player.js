class Player {
    // Element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position = position;
        this.position ??= Vector2.fromBoundingRect(element.getBoundingClientRect());
        this.velocity = new Vector2(0, 0);
    }
    update() {
        if (PlayerInputsController.MoveRight) {
            player.position.x += 5;
        }
        if (PlayerInputsController.MoveLeft) {
            player.position.x -= 5;
        }
        
        // Gravity
        this.velocity.add(new Vector2(0, 0.25));
        this.position.add(this.velocity);

        // Pretend there's ground  
        const ground = getElement("ground");
        const groundLevel = ground.getBoundingClientRect().top;
        const playerHeight = this.element.getBoundingClientRect().height;
        const maxY = groundLevel - playerHeight;
        if (this.position.y > maxY) {
            this.velocity.y = 0;
            this.position.y = maxY;
        }
        
        // TODO: Collision detection
    }
    render() {
        renderElement(this.element, this.position);
    }
}