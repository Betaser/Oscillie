class Player {

    // element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position = position;
        console.log(this.element);
        this.position ??= Vector2.fromBoundingRect(this.element.getBoundingClientRect());
        this.bounds = Polygon.fromBoundingRect(this.element.getBoundingClientRect());
        this.velocity = new Vector2(0, 0);
    }

    update() {
        if (PlayerInputsController.MoveRight) {
            this.velocity.x += 1;
        }
        if (PlayerInputsController.MoveLeft) {
            this.velocity.x -= 1;
        }
        
        if (!PlayerInputsController.DebugTurnOffGravity) {
            // Gravity
            this.velocity.add(new Vector2(0, 0.25));
        }

        // Pretend there's ground  
        // With this pretend ground, apply major friction.
        const ground = getElement("ground");
        const groundLevel = ground.getBoundingClientRect().top;
        const playerHeight = this.element.getBoundingClientRect().height;
        const maxY = groundLevel - playerHeight;
        if (this.position.y > maxY) {
            this.velocity.y = 0;
            this.position.y = maxY;

            this.velocity.x /= 1.2;
        }

        this.position.add(this.velocity);

        // TODO: Collision detection
    }

    renderBounds() {
        renderElementBounds(this.bounds);
    }

    render() {
        renderElement(this.element, this.position);

        this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));
    }
}